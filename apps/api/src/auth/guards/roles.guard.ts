import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser {
  user?: {
    id: string;
    email: string;
    organizationId?: string;
    branchId?: string | null;
    role?: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        MembershipRole[]
      >(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Authenticated user is required',
      );
    }

    if (!user.role) {
      throw new ForbiddenException(
        'No organization role found',
      );
    }

    const hasRole = requiredRoles.includes(
      user.role as MembershipRole,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}