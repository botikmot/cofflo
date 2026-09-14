import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import * as bcrypt from 'bcrypt';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    dto: CreateMembershipDto,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (dto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: dto.branchId,
          organizationId,
        },
      });

      if (!branch) {
        throw new BadRequestException(
          'Branch does not belong to this organization',
        );
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase().trim(),
      },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    let user = existingUser;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
    } else {
      const existingMembership =
        await this.prisma.membership.findFirst({
          where: {
            userId: existingUser?.id,
            organizationId,
            branchId: dto.branchId ?? null,
          },
        });

      if (existingMembership) {
        throw new ConflictException(
          'User is already a member of this organization or branch',
        );
      }
    }

    const membership = await this.prisma.membership.create({
      data: {
        userId: user.id,
        organizationId,
        branchId: dto.branchId,
        role: dto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return membership;
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

    return this.prisma.membership.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  async findOneByOrganization(
    organizationId: string,
    membershipId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          id: membershipId,
          organizationId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              status: true,
              createdAt: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Membership not found in this organization',
      );
    }

    return membership;
  }

  async update(
    organizationId: string,
    membershipId: string,
    dto: UpdateMembershipDto,
    currentUserId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          id: membershipId,
          organizationId,
        },
        include: {
          user: true,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Membership not found in this organization',
      );
    }

    const currentUserMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId: currentUserId,
          organizationId,
        },
      });

    if (!currentUserMembership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    const isTargetOwner =
      membership.role === MembershipRole.OWNER;

    const isCurrentUserOwner =
      currentUserMembership.role === MembershipRole.OWNER;

    // Only OWNER can modify another OWNER.
    if (isTargetOwner && !isCurrentUserOwner) {
      throw new ForbiddenException(
        'Only the organization owner can modify an owner membership',
      );
    }

    // Prevent changing the only OWNER into another role.
    if (
      isTargetOwner &&
      dto.role &&
      dto.role !== MembershipRole.OWNER
    ) {
      const ownerCount =
        await this.prisma.membership.count({
          where: {
            organizationId,
            role: MembershipRole.OWNER,
          },
        });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'The organization must have at least one owner',
        );
      }
    }

    if (
      dto.branchId !== undefined &&
      dto.branchId !== null
    ) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: dto.branchId,
          organizationId,
        },
      });

      if (!branch) {
        throw new BadRequestException(
          'Branch does not belong to this organization',
        );
      }
    }

    const nextBranchId =
      dto.branchId !== undefined
        ? dto.branchId
        : membership.branchId;

    const nextRole =
      dto.role !== undefined
        ? dto.role
        : membership.role;

    const duplicateMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId: membership.userId,
          organizationId,
          branchId: nextBranchId,
          NOT: {
            id: membershipId,
          },
        },
      });

    if (duplicateMembership) {
      throw new ConflictException(
        'User already has a membership for this organization or branch',
      );
    }

    return this.prisma.membership.update({
      where: {
        id: membershipId,
      },
      data: {
        role: nextRole,
        branchId: nextBranchId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
            createdAt: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(
    organizationId: string,
    membershipId: string,
    currentUserId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          id: membershipId,
          organizationId,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Membership not found in this organization',
      );
    }

    const currentUserMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId: currentUserId,
          organizationId,
        },
      });

    if (!currentUserMembership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    if (membership.userId === currentUserId) {
      throw new ForbiddenException(
        'You cannot remove your own organization membership',
      );
    }

    if (
      membership.role === MembershipRole.OWNER
    ) {
      const ownerCount =
        await this.prisma.membership.count({
          where: {
            organizationId,
            role: MembershipRole.OWNER,
          },
        });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'The organization must have at least one owner',
        );
      }

      if (
        currentUserMembership.role !==
        MembershipRole.OWNER
      ) {
        throw new ForbiddenException(
          'Only the organization owner can remove another owner',
        );
      }
    }

    await this.prisma.membership.delete({
      where: {
        id: membershipId,
      },
    });

    return {
      message: 'Membership removed successfully',
    };
  }

}