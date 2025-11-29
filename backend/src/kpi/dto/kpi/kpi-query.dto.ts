import { IsOptional, IsString, IsNumberString, IsEnum, IsBoolean } from 'class-validator';
import { EvaluationCode } from '../../entities/evaluation-type.entity';

export class KPIQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  evaluationTypeId?: string;
}
