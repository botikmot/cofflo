import {
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { MembershipRole } from '@prisma/client';

export class UpdateMembershipDto {
  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;

  @IsOptional()
  @IsUUID()
  branchId?: string | null;
}