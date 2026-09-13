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

  async create(organizationId: string, dto: CreateBranchDto) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
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

    return this.prisma.branch.create({
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
}