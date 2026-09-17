import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { createSlug } from './branch-slug.util';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateBranchDto, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const creatorMembership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
      },
      orderBy: [
        {
          role: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    if (!creatorMembership) {
      throw new NotFoundException('Organization membership not found');
    }

    if (
      creatorMembership.role !== 'OWNER' &&
      creatorMembership.role !== 'ADMIN'
    ) {
      throw new ConflictException(
        'Only owners and admins can create branches.',
      );
    }

    const baseSlug = createSlug(dto.name);

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.branch.findUnique({
        where: {
          organizationId_slug: {
            organizationId,
            slug,
          },
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          organizationId,
          name: dto.name,
          slug,
          description: dto.description,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          timezone: dto.timezone ?? 'Asia/Manila',
        },
      });

      await tx.membership.create({
        data: {
          userId,
          organizationId,
          branchId: branch.id,
          role: creatorMembership.role,
        },
      });

      return branch;
    });
  }

  async findAllByOrganization(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.branch.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id,
      },
      include: {
        organization: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async remove(organizationId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const branchCount = await this.prisma.branch.count({
      where: {
        organizationId,
      },
    });

    if (branchCount <= 1) {
      throw new ConflictException(
        'You cannot remove the only branch in an organization.',
      );
    }

    const [
      membershipCount,
      invitationCount,
      inventoryItemCount,
      inventoryMovementCount,
      orderCount,
      paymentCount,
      tableCount,
      reservationCount,
      queueEntryCount,
      tableSessionCount,
    ] = await Promise.all([
      this.prisma.membership.count({
        where: {
          branchId,
        },
      }),

      this.prisma.invitation.count({
        where: {
          branchId,
        },
      }),

      this.prisma.inventoryItem.count({
        where: {
          branchId,
        },
      }),

      this.prisma.inventoryMovement.count({
        where: {
          branchId,
        },
      }),

      this.prisma.order.count({
        where: {
          branchId,
        },
      }),

      this.prisma.payment.count({
        where: {
          branchId,
        },
      }),

      this.prisma.table.count({
        where: {
          branchId,
        },
      }),

      this.prisma.reservation.count({
        where: {
          branchId,
        },
      }),

      this.prisma.queueEntry.count({
        where: {
          branchId,
        },
      }),

      this.prisma.tableSession.count({
        where: {
          branchId,
        },
      }),
    ]);

    const hasRelatedRecords =
      membershipCount > 0 ||
      invitationCount > 0 ||
      inventoryItemCount > 0 ||
      inventoryMovementCount > 0 ||
      orderCount > 0 ||
      paymentCount > 0 ||
      tableCount > 0 ||
      reservationCount > 0 ||
      queueEntryCount > 0 ||
      tableSessionCount > 0;

    if (hasRelatedRecords) {
      throw new ConflictException(
        'This branch cannot be removed because it still has associated records. Deactivate the branch instead.',
      );
    }

    await this.prisma.branch.delete({
      where: {
        id: branchId,
      },
    });

    return {
      message: 'Branch removed successfully.',
      branchId,
    };
  }
}
