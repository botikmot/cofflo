import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AuthService } from '../auth/auth.service';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import * as bcrypt from 'bcrypt';
import { slugify } from '../common/utils/slug.util';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateOrganizationDto) {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        slug: dto.slug,
      },
    });

    if (existingOrganization) {
      throw new ConflictException(
        'An organization with this slug already exists',
      );
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        tagline: dto.tagline,
        description: dto.description,
        logoUrl: dto.logoUrl,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        website: dto.website,
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        branches: true,
        memberships: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const email =
      organization.email ?? organization.memberships[0]?.user?.email ?? null;

    return {
      ...organization,
      email,
    };
  }

  async onboard(dto: OnboardOrganizationDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const organizationName = dto.organizationName.trim();

    const branchName = dto.branchName.trim();

    const firstName = dto.firstName.trim();

    const lastName = dto.lastName?.trim() || null;

    const organizationSlug = slugify(organizationName);

    const branchSlug = slugify(branchName);

    if (!organizationSlug) {
      throw new ConflictException(
        'Organization name must contain valid characters',
      );
    }

    if (!branchSlug) {
      throw new ConflictException('Branch name must contain valid characters');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        slug: organizationSlug,
      },
      select: {
        id: true,
      },
    });

    if (existingOrganization) {
      throw new ConflictException('Organization name is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          currency: dto.currency,
        },
      });

      const branch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: branchName,
          slug: branchSlug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          branchId: branch.id,
          role: MembershipRole.OWNER,
        },
      });

      return {
        user,
        organization,
        branch,
        membership,
      };
    });

    const accessToken = await this.authService.generateAccessToken({
      id: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      branchId: result.branch.id,
      role: result.membership.role,
    });

    return {
      accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        status: result.user.status,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        status: result.organization.status,
      },
      branch: {
        id: result.branch.id,
        name: result.branch.name,
        slug: result.branch.slug,
        isActive: result.branch.isActive,
      },
      membership: {
        id: result.membership.id,
        role: result.membership.role,
      },
    };
  }
}
