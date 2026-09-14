import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { TablesService } from './tables.service';

@Controller(
  'organizations/:organizationId/branches/:branchId/tables',
)
@UseGuards(
  JwtAuthGuard,
  OrganizationAccessGuard,
)
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
  ) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.tablesService.create(
      organizationId,
      branchId,
      dto,
    );
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.tablesService.findAll(
      organizationId,
      branchId,
    );
  }

  @Get(':tableId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.tablesService.findOne(
      organizationId,
      branchId,
      tableId,
    );
  }

  @Patch(':tableId')
  update(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(
      organizationId,
      branchId,
      tableId,
      dto,
    );
  }

  @Patch(':tableId/status')
  updateStatus(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(
      organizationId,
      branchId,
      tableId,
      dto,
    );
  }

  @Delete(':tableId')
  archive(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.tablesService.archive(
      organizationId,
      branchId,
      tableId,
    );
  }
}