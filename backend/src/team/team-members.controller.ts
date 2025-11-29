import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
  Req,
} from '@nestjs/common';
import { TeamMembersService, TeamMemberFilters } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMember } from './entities/team-member.entity';

@Controller('team-members')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @Post()
  create(@Body() dto: CreateTeamMemberDto): Promise<TeamMember> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('teamId') teamId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('parentTeamId') parentTeamId?: string,
    @Query('active') active?: string, // "true" | "false"
  ): Promise<TeamMember[]> {
    const filters: TeamMemberFilters = {
      teamId,
      employeeId,
      parentTeamId,
      active: typeof active === 'string' ? active === 'true' : undefined,
    };
    return this.service.findAll(req.user  , filters);
  }

  @Get('kpi')
  findAllTeamMembersForKPI(
    @Req() req: any,
    @Query('teamId') teamId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('parentTeamId') parentTeamId?: string,
    @Query('active') active?: string, // "true" | "false"
  ): Promise<TeamMember[]> {
    const filters: TeamMemberFilters = {
      teamId,
      employeeId,
      parentTeamId,
      active: typeof active === 'string' ? active === 'true' : undefined,
    };
    return this.service.findAllTeamMembersForKPI(req.user  , filters);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<TeamMember> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}