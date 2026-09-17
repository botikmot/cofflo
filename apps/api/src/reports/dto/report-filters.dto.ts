import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReportFiltersDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
