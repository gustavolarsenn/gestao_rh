import { IsUUID, IsEnum, IsOptional, IsNumberString, IsString, IsDateString } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class CreateTeamKpiEvolutionDto {
  @IsUUID() companyId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() teamKpiId!: string;

  @IsOptional() achievedValueEvolution?: string;

  @IsOptional() @IsString() rejectionReason?: string;

  @IsEnum(KpiStatus) status!: KpiStatus;

  @IsUUID() approvedBy!: string;
  @IsOptional() @IsDateString() approvedDate?: string; // client pode omitir; server pode setar now()

  @IsUUID() submittedBy!: string;
  @IsOptional() @IsDateString() submittedDate?: string;
}
