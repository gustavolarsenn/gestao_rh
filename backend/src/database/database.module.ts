import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { Company } from '../org/entities/company.entity';
import { Branch } from '../org/entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed/seed.service';
import { Person } from '../person/entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, Company, Branch, User, Person])],
  providers: [SeedService],
})
export class DatabaseSeedModule {}
