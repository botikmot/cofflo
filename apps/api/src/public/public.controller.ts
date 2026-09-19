import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PublicService } from './public.service';
import { OrdersService } from '../orders/orders.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly ordersService: OrdersService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('tables/:qrToken')
  async getTableByQrToken(@Param('qrToken') qrToken: string) {
    return this.publicService.getTableByQrToken(qrToken);
  }

  @Get('branches/:branchId')
  async getPublicBranch(@Param('branchId') branchId: string) {
    const branch = await this.publicService.getPublicBranch(branchId);

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
      },
      organization: {
        id: branch.organization.id,
        name: branch.organization.name,
        description: branch.organization.description,
        slug: branch.organization.slug,
        currency: branch.organization.currency,
      },
    };
  }

  @Get('branches/:branchId/reservation-availability')
  async getReservationAvailability(
    @Param('branchId') branchId: string,
    @Query('startAt') startAt: string,
    @Query('endAt') endAt: string,
    @Query('guestCount') guestCount: string,
  ) {
    return this.publicService.getReservationAvailability(
      branchId,
      startAt,
      endAt,
      Number(guestCount),
    );
  }

  @Post('branches/:branchId/reservations')
  async createReservation(
    @Param('branchId') branchId: string,
    @Body()
    body: {
      customerName: string;
      customerPhone?: string;
      guestCount: number;
      startAt: string;
      endAt: string;
      tableId?: string;
      notes?: string;
    },
  ) {
    return this.publicService.createPublicReservation(branchId, body);
  }

  @Get('reservations/:publicToken')
  async getReservation(@Param('publicToken') publicToken: string) {
    return this.publicService.getReservationByPublicToken(publicToken);
  }

  @Post('branches/:branchId/queue')
  async joinQueue(
    @Param('branchId') branchId: string,
    @Body()
    body: {
      customerName: string;
      customerPhone?: string;
      guestCount: number;
      notes?: string;
    },
  ) {
    return this.publicService.joinPublicQueue(branchId, body);
  }

  @Post('branches/:branchId/orders')
  async createPublicOrder(
    @Param('branchId') branchId: string,
    @Body() dto: CreatePublicOrderDto,
  ) {
    const branch = await this.publicService.getPublicBranch(branchId);

    const order = await this.ordersService.createPublic(
      branch.organizationId,
      branch.id,
      dto,
    );

    try {
      await this.notificationService.create({
        organizationId: branch.organizationId,
        branchId: branch.id,
        type: NotificationType.NEW_ORDER,
        title: 'New Customer Order',
        message: `New customer order ${order.orderNumber} has been placed.`,
        referenceId: order.id,
        referenceType: 'ORDER',
      });
    } catch (error) {
      console.error(
        '[Notifications] Failed to create order notification:',
        error,
      );
    }

    return {
      publicToken: order.publicToken,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      subtotal: order.subtotal,
      total: order.total,
      table: order.table
        ? {
            name: order.table.name,
            capacity: order.table.capacity,
            location: order.table.location,
          }
        : null,
      items: order.items,
    };
  }

  @Get('branches/:branchId/menu')
  async getPublicMenu(@Param('branchId') branchId: string) {
    return this.publicService.getPublicMenu(branchId);
  }

  @Get('branches/:branchId/tables')
  async getAvailableTables(@Param('branchId') branchId: string) {
    return this.publicService.getAvailableTables(branchId);
  }

  @Get('orders/:publicToken')
  async getPublicOrder(@Param('publicToken') publicToken: string) {
    return this.publicService.getPublicOrder(publicToken);
  }

  @Get('queue/:publicToken')
  async getQueue(@Param('publicToken') publicToken: string) {
    return this.publicService.getQueueByPublicToken(publicToken);
  }
}
