import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamsService } from './teams.service';
import { TeamMembersService } from './team-members.service';
import { TeamsController } from './teams.controller';
import { TeamMembersController } from './team-members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember])],
  controllers: [TeamsController, TeamMembersController],
  providers: [TeamsService, TeamMembersService],
  exports: [TeamsService, TeamMembersService],
})
export class TeamModule {}