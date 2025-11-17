import { IsNumberString, IsOptional } from 'class-validator';
import { IsUUID } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class EmployeeKPIQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

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