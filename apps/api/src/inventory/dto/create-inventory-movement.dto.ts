import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryMovementTypeDto {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE',
}

export class CreateInventoryMovementDto {
  @IsEnum(InventoryMovementTypeDto)
  type: InventoryMovementTypeDto;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}