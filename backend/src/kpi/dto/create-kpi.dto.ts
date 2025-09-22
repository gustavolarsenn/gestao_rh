import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateKpiDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() departmentId?: string;
  @IsUUID() evaluationTypeId!: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() unit?: string;
}