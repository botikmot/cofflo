import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { UpdateBranchSettingsDto } from './dto/update-branch-settings.dto';

type SettingsRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMembership(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
      },
      select: {
        id: true,
        role: true,
        organizationId: true,
        branchId: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization.',
      );
    }

    return membership;
  }

  private assertOrganizationSettingsAccess(role: SettingsRole) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only owners and admins can update organization settings.',
      );
    }
  }

  private assertBranchSettingsAccess(role: SettingsRole) {
    if (role !== 'OWNER' && role !== 'ADMIN' && role !== 'MANAGER') {
      throw new ForbiddenException(
        'You do not have permission to update branch settings.',
      );
    }
  }

  async getOrganizationSettings(userId: string, organizationId: string) {
    await this.getMembership(userId, organizationId);

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        currency: true,

        logoUrl: true,
        tagline: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,

        email: true,
        phone: true,
        address: true,
        website: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return organization;
  }

  async updateOrganizationSettings(
    userId: string,
    organizationId: string,
    dto: UpdateOrganizationSettingsDto,
  ) {
    const membership = await this.getMembership(userId, organizationId);

    this.assertOrganizationSettingsAccess(membership.role);

    const name = dto.name.trim();
    const slug = dto.slug.trim().toLowerCase();

    if (!name) {
      throw new BadRequestException('Organization name is required.');
    }

    if (!slug) {
      throw new BadRequestException('Organization slug is required.');
    }

    const existingSlug = await this.prisma.organization.findFirst({
      where: {
        slug,
        NOT: {
          id: organizationId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingSlug) {
      throw new BadRequestException(
        'That organization slug is already in use.',
      );
    }

    return this.prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name,
        slug,

        currency: dto.currency?.trim().toUpperCase() || 'PHP',

        tagline: dto.tagline?.trim() || null,
        description: dto.description?.trim() || null,

        primaryColor: dto.primaryColor?.trim() || null,
        secondaryColor: dto.secondaryColor?.trim() || null,

        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
        website: dto.website?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        currency: true,

        logoUrl: true,
        tagline: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,

        email: true,
        phone: true,
        address: true,
        website: true,

        updatedAt: true,
      },
    });
  }

  async getBranchSettings(
    userId: string,
    organizationId: string,
    branchId: string,
  ) {
    const membership = await this.getMembership(userId, organizationId);

    if (membership.role === 'STAFF' && membership.branchId !== branchId) {
      throw new ForbiddenException('You do not have access to this branch.');
    }

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return branch;
  }

  async updateBranchSettings(
    userId: string,
    organizationId: string,
    branchId: string,
    dto: UpdateBranchSettingsDto,
  ) {
    const membership = await this.getMembership(userId, organizationId);

    this.assertBranchSettingsAccess(membership.role);

    if (membership.role === 'MANAGER' && membership.branchId !== branchId) {
      throw new ForbiddenException(
        'Managers can only update their assigned branch.',
      );
    }

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const slug = dto.slug.trim().toLowerCase();

    if (!dto.name.trim()) {
      throw new BadRequestException('Branch name is required.');
    }

    if (!slug) {
      throw new BadRequestException('Branch slug is required.');
    }

    const existingSlug = await this.prisma.branch.findFirst({
      where: {
        organizationId,
        slug,
        NOT: {
          id: branchId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingSlug) {
      throw new BadRequestException('That branch slug is already in use.');
    }

    return this.prisma.branch.update({
      where: {
        id: branchId,
      },
      data: {
        name: dto.name.trim(),
        slug,

        description: dto.description?.trim() || null,
        phone: dto.phone?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        address: dto.address?.trim() || null,
        timezone: dto.timezone?.trim() || 'Asia/Manila',
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
