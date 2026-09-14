import { IsEnum } from 'class-validator';

export enum TableStatusDto {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export class UpdateTableStatusDto {
  @IsEnum(TableStatusDto)
  status: TableStatusDto;
}