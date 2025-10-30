import { IsUUID, IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsDateString } from 'class-validator';

export class CreatePersonDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() birthDate?: string | null;
  @IsString() phone?: string | null;
  @IsString() address?: string | null;
  @IsString() addressNumber?: string | null;
  @IsString() zipCode?: string | null;
  @IsString() cpf!: string;
  @IsUUID() cityId?: string | null;
}