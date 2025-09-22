import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamKpiDto } from './create-team-kpi.dto';

export class UpdateTeamKpiDto extends PartialType(CreateTeamKpiDto) {}