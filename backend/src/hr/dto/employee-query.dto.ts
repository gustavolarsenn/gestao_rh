import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';

export class EmployeeQueryDto {
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
  teamId?: string;
  
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  roleTypeId?: string;
  
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
