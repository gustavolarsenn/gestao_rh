import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';
import { UsersController } from './users.controller';
import { UserRolesController } from './user-roles.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { Person } from '../person/entities/person.entity';
import { EmployeesService } from '../hr/employees.service';
import { Employee } from '../hr/entities/employee.entity';
import { Team } from '../team/entities/team.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { EmployeeHistory } from '../hr/entities/employee-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Person, Employee, EmployeeHistory, Team, TeamMember])],
  controllers: [UsersController, UserRolesController],
  providers: [UsersService, UserRolesService, EmployeesService],
  exports: [UsersService, UserRolesService, EmployeesService],
})
export class UsersModule {}