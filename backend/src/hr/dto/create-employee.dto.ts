import { IsDateString, IsOptional, IsString, IsUUID, IsNumberString } from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;

  @IsOptional() @IsUUID() roleId?: string;
  @IsOptional() @IsUUID() roleTypeId?: string;
  @IsOptional() @IsUUID() teamId?: string;

  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsUUID() branchId?: string;

  @IsOptional() @IsNumberString() wage?: string;
  @IsOptional() @IsDateString() hiringDate?: string;
  @IsOptional() @IsDateString() departureDate?: string;
}