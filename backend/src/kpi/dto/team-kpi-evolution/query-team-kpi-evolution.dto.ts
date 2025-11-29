import { IsNumberString, IsOptional } from 'class-validator';
import { IsUUID } from 'class-validator';
import { KpiStatus } from '../../entities/kpi.enums';

export class TeamKpiEvolutionQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
  
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  teamKpiId?: string;

  @IsOptional()
  status?: KpiStatus;
}