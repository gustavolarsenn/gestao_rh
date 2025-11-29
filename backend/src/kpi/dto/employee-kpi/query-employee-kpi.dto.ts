import { IsNumberString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
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
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  periodStart?: string;

  @IsOptional()
  periodEnd?: string;

  @IsOptional()
  status?: KpiStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  showExpired: boolean = true;
}