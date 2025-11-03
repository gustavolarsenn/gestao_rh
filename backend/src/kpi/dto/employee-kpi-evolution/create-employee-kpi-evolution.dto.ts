import { IsUUID, IsEnum, IsOptional, IsDateString, IsNumberString, IsString } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class CreateEmployeeKpiEvolutionDto {
  @IsUUID() employeeKpiId!: string;

  @IsOptional() achievedValueEvolution?: string;

  @IsOptional() @IsUUID() raterEmployeeId?: string;
  @IsOptional() @IsString() rejectionReason?: string;

  @IsEnum(KpiStatus) status!: KpiStatus;

  @IsOptional() @IsUUID() approvedBy?: string;
  @IsOptional() @IsString() approvedDate?: string; // client pode omitir; server pode setar now()
  
  @IsOptional() @IsUUID() submittedBy?: string;
  @IsOptional() @IsString() submittedDate?: string; // client pode omitir; server pode setar now()
}