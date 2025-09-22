import { IsUUID, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
}