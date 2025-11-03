import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { CareerPath } from './entities/career-path.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeHistoriesService } from './employee-histories.service';
import { EmployeeHistoriesController } from './employee-histories.controller';
import { CareerPathsService } from './career-paths.service';
import { CareerPathsController } from './career-paths.controller';
import { Person } from '../person/entities/person.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { Team } from '../team/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeHistory, CareerPath, Person, Team, TeamMember])],
  controllers: [
    EmployeesController,
    EmployeeHistoriesController,
    CareerPathsController,
  ],
  providers: [
    EmployeesService,
    EmployeeHistoriesService,
    CareerPathsService,
  ],
  exports: [
    EmployeesService,
    EmployeeHistoriesService,
    CareerPathsService,
  ],
})
export class HrModule {}