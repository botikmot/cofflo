import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'User account is not active',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(
      payload,
    );

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
      status: user.status,
      memberships: user.memberships,
    };
  }

  async getMembershipContext(
    userId: string,
    organizationId: string,
    branchId?: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
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

}