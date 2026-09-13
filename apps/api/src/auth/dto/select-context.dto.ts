import {
  IsOptional,
  IsUUID,
} from 'class-validator';

export class SelectContextDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}