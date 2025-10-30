import { IsUUID, IsString } from 'class-validator';

export class CreateRoleTypeDto {
  @IsUUID() companyId!: string;
  @IsUUID() departmentId!: string;
  @IsString() name!: string;
}