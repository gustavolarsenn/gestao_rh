import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class branchQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
