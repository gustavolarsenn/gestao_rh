import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';

export class TeamQueryDto {
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
  parentTeamId?: string;
}
