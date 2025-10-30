import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @IsString() name!: string;
  @IsString() cnpj!: string | undefined;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressNumber?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsUUID() cityId!: string;
}