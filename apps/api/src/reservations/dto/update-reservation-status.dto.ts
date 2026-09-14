import { IsEnum } from 'class-validator';

export enum ReservationStatusDto {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatusDto)
  status: ReservationStatusDto;
}