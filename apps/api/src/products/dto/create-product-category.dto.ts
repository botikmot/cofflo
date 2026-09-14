import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}