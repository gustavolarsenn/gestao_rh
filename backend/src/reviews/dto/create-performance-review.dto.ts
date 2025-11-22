import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsUUID() companyId!: string;

  @IsUUID() employeeId!: string;  // avaliado
  @IsUUID() @IsOptional() leaderId?: string;    // avaliador (líder)

  @IsOptional() @IsString()
  observation?: string;

  @IsDateString()
  date!: string;
}