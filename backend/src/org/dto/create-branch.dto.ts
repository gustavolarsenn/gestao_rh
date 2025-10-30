import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBranchDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsString() cnpj!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressNumber?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsDateString() openingDate?: string;
  @IsUUID() cityId!: string;
}