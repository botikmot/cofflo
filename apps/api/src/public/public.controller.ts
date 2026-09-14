import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('tables/:qrToken')
  async getTableByQrToken(@Param('qrToken') qrToken: string) {
    return this.publicService.getTableByQrToken(qrToken);
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

  @Get('queue/:publicToken')
  async getQueue(@Param('publicToken') publicToken: string) {
    return this.publicService.getQueueByPublicToken(publicToken);
  }
}
