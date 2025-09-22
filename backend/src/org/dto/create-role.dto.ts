import { IsUUID, IsString, IsOptional, IsNumberString } from 'class-validator';

export class CreateRoleDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;

  @IsOptional() @IsUUID() departmentId?: string;

  @IsOptional() @IsNumberString() defaultWage?: string;
}