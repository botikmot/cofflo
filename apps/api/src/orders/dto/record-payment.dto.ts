import { IsEnum, IsNumber, Min } from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  GCASH = 'GCASH',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export class RecordPaymentDto {
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amountReceived: number;
}