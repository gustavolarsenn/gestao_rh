import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  // @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressNumber?: string;
  @IsOptional() @IsString() zipCode?: string;
}