import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EvaluationType } from './entities/evaluation-type.entity';
import { KPI } from './entities/kpi.entity';
import { EmployeeKPI } from './entities/employee-kpi.entity';
import { EmployeeKPIEvolution } from './entities/employee-kpi-evolution.entity';
import { TeamKPI } from './entities/team-kpi.entity';
import { TeamKPIEvolution } from './entities/team-kpi-evolution.entity';

import { EvaluationTypesService } from './evaluation-types/evaluation-types.service';
import { KpisService } from './kpis.service';
import { EmployeeKpisService } from './employee-kpis/employee-kpis.service';
import { EmployeeKpiEvolutionsService } from './employee-kpi-evolutions/employee-kpi-evolutions.service';
import { TeamKpisService } from './team-kpis/team-kpis.service';
import { TeamKpiEvolutionsService } from './team-kpi-evolutions/team-kpi-evolutions.service';

import { EvaluationTypesController } from './evaluation-types/evaluation-types.controller';
import { KpisController } from './kpis.controller';
import { EmployeeKpisController } from './employee-kpis/employee-kpis.controller';
import { EmployeeKpiEvolutionsController } from './employee-kpi-evolutions/employee-kpi-evolutions.controller';
import { TeamKpisController } from './team-kpis/team-kpis.controller';
import { TeamKpiEvolutionsController } from './team-kpi-evolutions/team-kpi-evolutions.controller';
import { Team } from '../team/entities/team.entity';
import { TeamsService } from '../team/teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationType, KPI, EmployeeKPI, TeamKPI, EmployeeKPIEvolution, TeamKPIEvolution, Team])],
  providers: [EvaluationTypesService, KpisService, EmployeeKpisService, EmployeeKpiEvolutionsService, TeamKpisService, TeamKpiEvolutionsService, TeamsService],
  controllers: [EvaluationTypesController, KpisController, EmployeeKpisController, EmployeeKpiEvolutionsController, TeamKpisController, TeamKpiEvolutionsController],
  exports: [EvaluationTypesService, KpisService, EmployeeKpisService, EmployeeKpiEvolutionsService, TeamKpisService, TeamKpiEvolutionsService, TeamsService],
})
export class KpiModule {}