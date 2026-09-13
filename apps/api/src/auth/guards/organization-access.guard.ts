import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../types/auth-user.type';

interface OrganizationRequest extends Request {
  user?: AuthUser;
  organizationMembership?: {
    id: string;
    userId: string;
    organizationId: string;
    branchId: string | null;
    role: string;
  };
}

@Injectable()
export class OrganizationAccessGuard
  implements CanActivate
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OrganizationRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Authentication required',
      );
    }

    const organizationId =
      request.params.organizationId;

    if (
      typeof organizationId !== 'string' ||
      !organizationId.trim()
    ) {
      throw new ForbiddenException(
        'Valid organization ID is required',
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId: user.id,
          organizationId,
        },
        select: {
          id: true,
          userId: true,
          organizationId: true,
          branchId: true,
          role: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    request.organizationMembership = membership;

    return true;
  }
}