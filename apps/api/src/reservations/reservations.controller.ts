import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationAccessGuard } from '../auth/guards/organization-access.guard';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationsService } from './reservations.service';

@Controller(
  'organizations/:organizationId/branches/:branchId/reservations',
)
@UseGuards(
  JwtAuthGuard,
  OrganizationAccessGuard,
)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(
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
    return this.reservationsService.findAll(
      organizationId,
      branchId,
    );
  }

  @Get('availability')
  findAvailableTables(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Query('startAt') startAt: string,
    @Query('endAt') endAt: string,
    @Query('guestCount') guestCount: string,
  ) {
    return this.reservationsService.findAvailableTables(
      organizationId,
      branchId,
      new Date(startAt),
      new Date(endAt),
      Number(guestCount),
    );
  }

  @Get(':reservationId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('reservationId') reservationId: string,
  ) {
    return this.reservationsService.findOne(
      organizationId,
      branchId,
      reservationId,
    );
  }

  @Patch(':reservationId')
  update(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('reservationId') reservationId: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(
      organizationId,
      branchId,
      reservationId,
      dto,
    );
  }

  @Patch(':reservationId/status')
  updateStatus(
    @Param('organizationId') organizationId: string,
    @Param('branchId') branchId: string,
    @Param('reservationId') reservationId: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(
      organizationId,
      branchId,
      reservationId,
      dto,
    );
  }

}