import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  MinLength,
} from 'class-validator';
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from '../../common/constants/currencies';

export class OnboardOrganizationDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  branchName: string;

  @IsIn(SUPPORTED_CURRENCIES)
  currency: SupportedCurrency;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
