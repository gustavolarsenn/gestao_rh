import { IsUUID, IsEnum, IsOptional, IsDateString, IsNumberString, IsString } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class CreateEmployeeKpiDto {
  @IsUUID() companyId!: string;
  @IsUUID() employeeId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() kpiId!: string;
  @IsUUID() evaluationTypeId!: string;

  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;

  @IsOptional() @IsNumberString() goal?: string;
  @IsOptional() @IsNumberString() achievedValue?: string;

  @IsOptional() @IsUUID() raterEmployeeId?: string;

  @IsOptional() @IsString() rejectionReason?: string;

  @IsEnum(KpiStatus) status!: KpiStatus;

  @IsOptional() @IsUUID() approvedBy?: string;
  @IsOptional() @IsString() approvedDate?: string; // client pode omitir; server pode setar now()

  @IsUUID() submittedBy!: string;
  @IsOptional() @IsString() submittedDate?: string; // client pode omitir; server pode setar now()
}