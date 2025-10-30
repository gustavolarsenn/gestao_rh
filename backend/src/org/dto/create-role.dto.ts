import { IsUUID, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  
  @IsUUID() roleTypeId!: string;
  @IsUUID() departmentId!: string;

  @IsOptional() @IsNumber() defaultWage?: string;
}