import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { EvaluationCode } from '../../entities/evaluation-type.entity';

export class EvaluationTypeQueryDto {
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

  @IsEnum(EvaluationCode) 
  @IsOptional()
  code?: EvaluationCode; // HIGHER_BETTER | LOWER_BETTER | BINARY
  
}
