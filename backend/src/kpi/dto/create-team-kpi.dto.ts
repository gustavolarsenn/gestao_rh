import { IsUUID, IsEnum, IsOptional, IsDateString, IsNumberString, IsString } from 'class-validator';
import { KpiSource } from '../entities/kpi.enums';

export class CreateTeamKpiDto {
  @IsUUID() companyId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() kpiId!: string;
  @IsUUID() evaluationTypeId!: string;

  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;

  @IsOptional() @IsNumberString() goal?: string;
  @IsOptional() @IsNumberString() achievedValue?: string;

  @IsEnum(KpiSource) source!: KpiSource;

  @IsUUID() submittedBy!: string;
  @IsOptional() @IsString() submittedDate?: string;
}
