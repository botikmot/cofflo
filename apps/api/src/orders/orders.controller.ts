import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';
import type { AuthUser } from '../auth/types/auth-user.type';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { OrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Controller('organizations/:organizationId/branches/:branchId/orders')
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.create(organizationId, branchId, user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, OrganizationAccessGuard)
  findAll(
    @Param('organizationId')
    organizationId: string,

    @Param('branchId')
    branchId: string,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,

    @Query('status')
    status?: OrderStatusDto,

    @Query('search')
    search?: string,
  ) {
    return this.ordersService.findAll(
      organizationId,
      branchId,
      Number(page) || 1,
      Number(limit) || 20,
      status,
      search,
    );
  }

  @Get(':orderId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findOne(organizationId, branchId, orderId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      organizationId,
      branchId,
      orderId,
      dto.status,
    );
  }

  @Post(':orderId/payment')
  recordPayment(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.recordPayment(
      organizationId,
      branchId,
      orderId,
      user.id,
      dto,
    );
  }
}
