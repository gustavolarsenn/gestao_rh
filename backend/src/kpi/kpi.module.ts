import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EvaluationType } from './entities/evaluation-type.entity';
import { KPI } from './entities/kpi.entity';
import { EmployeeKPI } from './entities/employee-kpi.entity';
import { TeamKPI } from './entities/team-kpi.entity';

import { EvaluationTypesService } from './evaluation-types.service';
import { KpisService } from './kpis.service';
import { EmployeeKpisService } from './employee-kpis.service';
import { TeamKpisService } from './team-kpis.service';

import { EvaluationTypesController } from './evaluation-types.controller';
import { KpisController } from './kpis.controller';
import { EmployeeKpisController } from './employee-kpis.controller';
import { TeamKpisController } from './team-kpis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationType, KPI, EmployeeKPI, TeamKPI])],
  providers: [EvaluationTypesService, KpisService, EmployeeKpisService, TeamKpisService],
  controllers: [EvaluationTypesController, KpisController, EmployeeKpisController, TeamKpisController],
  exports: [EvaluationTypesService, KpisService, EmployeeKpisService, TeamKpisService],
})
export class KpiModule {}