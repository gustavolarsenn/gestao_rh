import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateCareerPathDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  departmentId!: string;

  @IsUUID()
  currentRoleId!: string;

  @IsUUID()
  nextRoleId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isEntryPoint?: boolean;
}
