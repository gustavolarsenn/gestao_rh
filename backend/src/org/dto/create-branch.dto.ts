import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBranchDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsOptional() @IsDateString() openingDate?: string;
}