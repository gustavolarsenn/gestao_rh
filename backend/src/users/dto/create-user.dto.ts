import { IsUUID, IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;

  @IsEmail() email!: string;

  @MinLength(8) password!: string;

  @IsOptional() @IsDateString() birthDate?: string | null;
  @IsOptional() @IsBoolean() isActive?: boolean;
}