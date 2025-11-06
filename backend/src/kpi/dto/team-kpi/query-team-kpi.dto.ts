import { IsOptional } from 'class-validator';
import { IsUUID } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class TeamKPIQueryDto {
  @IsOptional()
  @IsUUID()
  kpiId?: string;

  @IsOptional()
  periodStart?: string;

  @IsOptional()
  periodEnd?: string;

  @IsOptional()
  status?: KpiStatus;
}