import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class UserQueryDto {
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
  email?: string;

  @IsOptional()
  @IsString()
  roleId?: string;
  
  @IsOptional()
  @IsString()
  cityId?: string;
}
