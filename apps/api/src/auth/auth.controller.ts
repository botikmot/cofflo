import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SelectContextDto } from './dto/select-context.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from './dto/change-password.dto';

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
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user.id);
  }

  @Post('context')
  @UseGuards(JwtAuthGuard)
  async selectContext(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SelectContextDto,
  ) {
    const membership = await this.authService.getMembershipContext(
      request.user.id,
      dto.organizationId,
      dto.branchId,
    );

    const accessToken = await this.authService.generateAccessToken({
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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileAvatar(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadProfileAvatar(req.user.id, file);
  }
}
