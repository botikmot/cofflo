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

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import type { AuthUser } from '../auth/types/auth-user.type';

import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';

@Controller('organizations/:organizationId/branches/:branchId/inventory')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  createItem(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateInventoryItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.createItem(
      organizationId,
      branchId,
      user.id,
      dto,
    );
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.inventoryService.findAll(organizationId, branchId);
  }

  @Get('low-stock')
  findLowStock(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.inventoryService.findLowStock(organizationId, branchId);
  }

  @Get(':inventoryItemId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.inventoryService.findOne(
      organizationId,
      branchId,
      inventoryItemId,
    );
  }

  @Patch(':inventoryItemId')
  updateItem(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateItem(
      organizationId,
      branchId,
      inventoryItemId,
      dto,
    );
  }

  @Delete(':inventoryItemId')
  archiveItem(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.inventoryService.archiveItem(
      organizationId,
      branchId,
      inventoryItemId,
    );
  }

  @Post(':inventoryItemId/restore')
  restoreItem(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.inventoryService.restoreItem(
      organizationId,
      branchId,
      inventoryItemId,
    );
  }

  @Post(':inventoryItemId/movements')
  createMovement(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
    @Body() dto: CreateInventoryMovementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.createMovement(
      organizationId,
      branchId,
      inventoryItemId,
      user.id,
      dto,
    );
  }

  @Get(':inventoryItemId/movements')
  getMovements(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('inventoryItemId') inventoryItemId: string,
  ) {
    return this.inventoryService.getMovements(
      organizationId,
      branchId,
      inventoryItemId,
    );
  }
}
