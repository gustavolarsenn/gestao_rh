import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsOptional() @IsUUID() departmentId?: string;
}