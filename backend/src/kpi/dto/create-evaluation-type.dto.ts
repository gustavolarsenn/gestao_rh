import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { EvaluationCode } from '../entities/evaluation-type.entity'; // ou de onde você exportar

export class CreateEvaluationTypeDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsEnum(EvaluationCode) code!: EvaluationCode; // HIGHER_BETTER | LOWER_BETTER | BINARY
  @IsOptional() @IsString() description?: string;
}