import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateCareerPathDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
}