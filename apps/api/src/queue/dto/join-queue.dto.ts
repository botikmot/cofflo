import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class JoinQueueDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsInt()
  @Min(1)
  guestCount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}