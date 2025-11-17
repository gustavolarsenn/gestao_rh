import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';

export class RoleQueryDto {
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
  roleTypeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}
