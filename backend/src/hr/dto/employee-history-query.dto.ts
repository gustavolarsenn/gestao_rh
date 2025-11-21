import { IsOptional, IsNumberString, IsEnum } from 'class-validator';

export class EmployeeHistoryQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
