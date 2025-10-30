import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';
import { UsersController } from './users.controller';
import { UserRolesController } from './user-roles.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { Person } from '../person/entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Person])],
  controllers: [UsersController, UserRolesController],
  providers: [UsersService, UserRolesService],
  exports: [UsersService, UserRolesService],
})
export class UsersModule {}