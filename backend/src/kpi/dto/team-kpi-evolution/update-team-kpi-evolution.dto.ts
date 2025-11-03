import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamKpiEvolutionDto } from './create-team-kpi-evolution.dto';

export class UpdateTeamKpiEvolutionDto extends PartialType(CreateTeamKpiEvolutionDto) {}