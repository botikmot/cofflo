import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { OrderTypeDto } from '../../orders/dto/create-order.dto';

export class CreatePublicOrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePublicOrderDto {
  @IsEnum(OrderTypeDto)
  orderType: OrderTypeDto;

  @IsOptional()
  @IsString()
  qrToken?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePublicOrderItemDto)
  items: CreatePublicOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
