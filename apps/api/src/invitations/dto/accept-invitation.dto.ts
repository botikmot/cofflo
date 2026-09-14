import {
  IsString,
  Length,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}