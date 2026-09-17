import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { ReportFiltersDto } from './dto/report-filters.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('organizations/:organizationId/reports')
  @UseGuards(JwtAuthGuard, OrganizationAccessGuard, RolesGuard)
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER)
  getReport(
    @Param('organizationId')
    organizationId: string,
    @Query()
    filters: ReportFiltersDto,
  ) {
    return this.reportsService.getReport(organizationId, filters);
  }
}
