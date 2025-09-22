import { IsUUID, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreateTeamMemberDto {
  @IsUUID() companyId!: string;
  @IsUUID() teamId!: string;
  @IsUUID() employeeId!: string;

  @IsOptional() @IsUUID() parentTeamId?: string;
  @IsBoolean() isLeader!: boolean;

  @IsDateString() startDate!: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() isHierarchyEdge?: boolean;
}