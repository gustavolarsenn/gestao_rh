import { IsUUID, IsEnum, IsOptional, IsDateString, IsNumberString, IsString } from 'class-validator';

export class CreateTeamKpiDto {
  @IsUUID() companyId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() kpiId!: string;
  @IsUUID() evaluationTypeId!: string;

  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;

  @IsOptional() @IsNumberString() goal?: string;
  @IsOptional() @IsNumberString() achievedValue?: string;

  @IsUUID() submittedBy!: string;
  @IsOptional() @IsString() submittedDate?: string;
}
