import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MembershipRole } from '@prisma/client';

export class CreateMembershipDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsEnum(MembershipRole)
  role: MembershipRole;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}