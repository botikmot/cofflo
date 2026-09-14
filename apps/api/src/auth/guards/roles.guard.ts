import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string | null;
  role: MembershipRole;
}

interface RequestWithAuth {
  user?: {
    id: string;
    email: string;
    organizationId?: string;
    branchId?: string | null;
    role?: string;
  };
  organizationMembership?: OrganizationMembership;
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

    // If endpoint has no @Roles(), allow it.
    if (!requiredRoles?.length) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<RequestWithAuth>();

    if (!request.user) {
      throw new ForbiddenException(
        'Authenticated user is required',
      );
    }

    const membership =
      request.organizationMembership;

    if (!membership) {
      throw new ForbiddenException(
        'No organization membership found',
      );
    }

    const hasRole = requiredRoles.includes(
      membership.role,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}