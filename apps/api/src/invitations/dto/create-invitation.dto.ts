import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { MembershipRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}