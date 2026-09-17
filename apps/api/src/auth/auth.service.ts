import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadsService } from '../uploads/uploads.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly uploadsService: UploadsService,
  ) {}

  async generateAccessToken(user: {
    id: string;
    email: string;
    organizationId?: string;
    branchId?: string | null;
    role?: string;
  }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      ...(user.organizationId
        ? {
            organizationId: user.organizationId,
          }
        : {}),
      ...(user.branchId !== undefined
        ? {
            branchId: user.branchId,
          }
        : {}),
      ...(user.role
        ? {
            role: user.role,
          }
        : {}),
    });
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
      memberships: user.memberships,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                description: true,
                tagline: true,
                slug: true,
                status: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      memberships: user.memberships,
    };
  }

  async getMembershipContext(
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        ...(branchId
          ? {
              branchId,
            }
          : {}),
      },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        branchId: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            tagline: true,
            slug: true,
            status: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization or branch',
      );
    }

    return membership;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName?.trim() || null,
        email: dto.email.trim().toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        avatarUrl: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                description: true,
                tagline: true,
                slug: true,
                status: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  async uploadProfileAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarPublicId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const result = await this.uploadsService.uploadProfileImage(file, userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: result.url,
        avatarPublicId: result.publicId,
      },
    });

    if (user.avatarPublicId) {
      try {
        await this.uploadsService.deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error('Failed to delete previous profile image:', error);
      }
    }

    return {
      avatarUrl: result.url,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const samePassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash,
    );

    if (samePassword) {
      throw new ForbiddenException(
        'New password must be different from your current password.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  }
}
