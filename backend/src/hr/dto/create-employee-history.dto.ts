import { IsUUID, IsOptional, IsNumberString, IsDateString } from 'class-validator';

export class CreateEmployeeHistoryDto {
  @IsUUID() companyId!: string;
  @IsUUID() employeeId!: string;
  @IsOptional() @IsUUID() roleId?: string;
  @IsOptional() @IsUUID() roleTypeId?: string;
  @IsOptional() @IsUUID() teamId?: string;
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsUUID() branchId?: string;
  @IsOptional() @IsNumberString() wage?: string;
  @IsDateString() hiringDate!: string;
  @IsOptional() @IsDateString() departureDate?: string | null;
  @IsDateString() startDate!: string;
  @IsOptional() @IsDateString() endDate?: string;
}