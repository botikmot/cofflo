import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

@Controller()
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post('organizations/:organizationId/members')
  @UseGuards(
    JwtAuthGuard,
    OrganizationAccessGuard,
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
  )
  findAllByOrganization(
    @Param('organizationId') organizationId: string,
  ) {
    return this.membershipsService.findAllByOrganization(
      organizationId,
    );
  }

  @Get('memberships/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }
}