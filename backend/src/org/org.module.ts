// src/org/org.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Branch } from './entities/branch.entity';
import { Department } from './entities/department.entity';
import { RoleType } from './entities/role-type.entity';
import { Role } from './entities/role.entity';
import { CompaniesService } from './companies.service';
import { BranchesService } from './branches.service';
import { DepartmentsService } from './departments.service';
import { RoleTypesService } from './role-types.service';
import { RolesService } from './roles.service';
import { CompaniesController } from './companies.controller';
import { BranchesController } from './branches.controller';
import { DepartmentsController } from './departments.controller';
import { RoleTypesController } from './role-types.controller';
import { RolesController } from './roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Branch, Department, RoleType, Role])],
  controllers: [
    CompaniesController,
    BranchesController,
    DepartmentsController,
    RoleTypesController,
    RolesController,
  ],
  providers: [
    CompaniesService,
    BranchesService,
    DepartmentsService,
    RoleTypesService,
    RolesService,
  ],
  exports: [
    CompaniesService,
    BranchesService,
    DepartmentsService,
    RoleTypesService,
    RolesService,
  ],
})
export class OrgModule {}