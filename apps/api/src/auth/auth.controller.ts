import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SelectContextDto } from './dto/select-context.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    status: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(
      request.user.id,
    );
  }

  @Post('context')
  @UseGuards(JwtAuthGuard)
  async selectContext(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SelectContextDto,
  ) {
    const membership =
      await this.authService.getMembershipContext(
        request.user.id,
        dto.organizationId,
        dto.branchId,
      );

    const accessToken =
      await this.authService.generateAccessToken({
        id: request.user.id,
        email: request.user.email,
        organizationId: membership.organizationId,
        branchId: membership.branchId,
        role: membership.role,
      });

    return {
      accessToken,
      context: {
        membershipId: membership.id,
        organizationId: membership.organizationId,
        branchId: membership.branchId,
        role: membership.role,
      },
      organization: membership.organization,
      branch: membership.branch,
    };
  }
}