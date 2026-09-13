import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, verify } from 'jsonwebtoken';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId?: string;
    branchId?: string | null;
    role?: string;
  };
}

interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  organizationId?: string;
  branchId?: string | null;
  role?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization =
      request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization token',
      );
    }

    const token = authorization.substring(7);

    const secret =
      this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new UnauthorizedException(
        'JWT_SECRET is not configured',
      );
    }

    try {
      const payload = verify(
        token,
        secret,
      ) as TokenPayload;

      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException(
          'Invalid token payload',
        );
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        branchId: payload.branchId,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}