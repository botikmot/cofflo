import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { InvitationsService } from './invitations.service';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

@Controller()
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  // =====================================================
  // CREATE INVITATION
  // POST /organizations/:organizationId/invitations
  // =====================================================

  @Post('organizations/:organizationId/invitations')
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
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(
      organizationId,
      dto,
    );
  }

  // =====================================================
  // FIND INVITATION BY TOKEN
  // GET /invitations/:token
  // =====================================================

  @Get('invitations/:token')
  findByToken(
    @Param('token') token: string,
  ) {
    return this.invitationsService.findByToken(
      token,
    );
  }

  // =====================================================
  // ACCEPT INVITATION
  // POST /invitations/:token/accept
  // =====================================================

  @Post('invitations/:token/accept')
  accept(
    @Param('token') token: string,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.invitationsService.accept(
      token,
      dto,
    );
  }

  // =====================================================
  // LIST ORGANIZATION INVITATIONS
  // GET /organizations/:organizationId/invitations
  // =====================================================

  @Get('organizations/:organizationId/invitations')
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
    return this.invitationsService.findAllByOrganization(
      organizationId,
    );
  }

  // =====================================================
  // GET ONE ORGANIZATION INVITATION
  // GET /organizations/:organizationId/invitations/:invitationId
  // =====================================================

  @Get(
    'organizations/:organizationId/invitations/:invitationId',
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
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitationsService.findOneByOrganization(
      organizationId,
      invitationId,
    );
  }

  // =====================================================
  // CANCEL INVITATION
  // PATCH /organizations/:organizationId/invitations/:invitationId/cancel
  // =====================================================

  @Patch(
    'organizations/:organizationId/invitations/:invitationId/cancel',
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
  cancel(
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitationsService.cancel(
      organizationId,
      invitationId,
    );
  }

  // =====================================================
  // RESEND INVITATION
  // PATCH /organizations/:organizationId/invitations/:invitationId/resend
  // =====================================================

  @Patch(
    'organizations/:organizationId/invitations/:invitationId/resend',
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
  resend(
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitationsService.resend(
      organizationId,
      invitationId,
    );
  }

}