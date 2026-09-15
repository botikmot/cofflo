import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import { TableSessionsService } from './table-sessions.service';

@Controller('organizations/:organizationId/branches/:branchId/tables')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class TableSessionsController {
  constructor(private readonly tableSessionsService: TableSessionsService) {}

  @Post(':tableId/session')
  openSession(
    @Param('organizationId')
    organizationId: string,
    @Param('branchId')
    branchId: string,
    @Param('tableId')
    tableId: string,
  ) {
    return this.tableSessionsService.openSession(
      organizationId,
      branchId,
      tableId,
    );
  }

  @Get(':tableId/session')
  getActiveSession(
    @Param('organizationId')
    organizationId: string,
    @Param('branchId')
    branchId: string,
    @Param('tableId')
    tableId: string,
  ) {
    return this.tableSessionsService.getActiveSession(
      organizationId,
      branchId,
      tableId,
    );
  }

  @Get('session/:sessionId')
  getSession(
    @Param('organizationId')
    organizationId: string,
    @Param('branchId')
    branchId: string,
    @Param('sessionId')
    sessionId: string,
  ) {
    return this.tableSessionsService.getSession(
      organizationId,
      branchId,
      sessionId,
    );
  }

  @Post(':tableId/session/:sessionId/close')
  closeSession(
    @Param('organizationId')
    organizationId: string,
    @Param('branchId')
    branchId: string,
    @Param('sessionId')
    sessionId: string,
  ) {
    return this.tableSessionsService.closeSession(
      organizationId,
      branchId,
      sessionId,
    );
  }
}
