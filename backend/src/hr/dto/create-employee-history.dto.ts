import { IsUUID, IsOptional, IsNumberString, IsDateString } from 'class-validator';

export class CreateEmployeeHistoryDto {
  @IsUUID() companyId!: string;
  @IsUUID() employeeId!: string;
  @IsOptional() @IsUUID() roleId?: string;
  @IsOptional() @IsNumberString() wage?: string;
  @IsDateString() startDate!: string;
  @IsOptional() @IsDateString() endDate?: string;
}