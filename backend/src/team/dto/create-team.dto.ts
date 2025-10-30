import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsString() description!: string;
  // @IsOptional() @IsUUID() departmentId?: string;
}