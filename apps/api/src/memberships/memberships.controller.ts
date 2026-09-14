import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipsService } from './memberships.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MembershipRole } from '@prisma/client';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller()
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post('organizations/:organizationId/members')
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
    RolesGuard,
  )
  @Roles(
    MembershipRole.OWNER,
    MembershipRole.ADMIN,
  )
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateMembershipDto,
  ) {
    return this.membershipsService.create(
      organizationId,
      dto,
    );
  }

  @Get('organizations/:organizationId/members')
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
    RolesGuard,
  )
  @Roles(
    MembershipRole.OWNER,
    MembershipRole.ADMIN,
    MembershipRole.MANAGER,
  )
  findAllByOrganization(
    @Param('organizationId') organizationId: string,
  ) {
    return this.membershipsService.findAllByOrganization(
      organizationId,
    );
  }

  @Get(
    'organizations/:organizationId/members/:membershipId',
  )
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
    RolesGuard,
  )
  @Roles(
    MembershipRole.OWNER,
    MembershipRole.ADMIN,
    MembershipRole.MANAGER,
  )
  findOneByOrganization(
    @Param('organizationId') organizationId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.membershipsService.findOneByOrganization(
      organizationId,
      membershipId,
    );
  }

  @Patch(
    'organizations/:organizationId/members/:membershipId',
  )
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
    RolesGuard,
  )
  @Roles(
    MembershipRole.OWNER,
    MembershipRole.ADMIN,
  )
  update(
    @Param('organizationId') organizationId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateMembershipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.membershipsService.update(
      organizationId,
      membershipId,
      dto,
      request.user.id,
    );
  }

  @Delete(
    'organizations/:organizationId/members/:membershipId',
  )
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
    RolesGuard,
  )
  @Roles(
    MembershipRole.OWNER,
    MembershipRole.ADMIN,
  )
  remove(
    @Param('organizationId') organizationId: string,
    @Param('membershipId') membershipId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.membershipsService.remove(
      organizationId,
      membershipId,
      request.user.id,
    );
  }
}