import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { TeamKpiEvolutionsService } from './team-kpi-evolutions.service';
import { CreateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/create-team-kpi-evolution.dto';
import { UpdateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/update-team-kpi-evolution.dto';
import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';
import { KpiStatus } from '../entities/kpi.enums';

@Controller('kpi/team-kpi-evolutions')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TeamKpiEvolutionsController {
  constructor(private readonly service: TeamKpiEvolutionsService) {}

  @Post()
  create(@Body() dto: CreateTeamKpiEvolutionDto): Promise<TeamKPIEvolution> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('teamId') teamId?: string,
    @Query('teamKpiId') teamKpiId?: string,
    @Query('submittedDate') submittedDate?: string,
    @Query('status') status?: KpiStatus,
  ): Promise<TeamKPIEvolution[]> {
    return this.service.findAll(companyId, { teamId, teamKpiId, submittedDate, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<TeamKPIEvolution> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateTeamKpiEvolutionDto): Promise<TeamKPIEvolution> {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Query('approverUserId', ParseUUIDPipe) approverUserId: string): Promise<TeamKPIEvolution> {
    return this.service.approve(companyId, id, approverUserId);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('approverUserId', ParseUUIDPipe) approverUserId: string,
    @Body('reason') reason?: string,
  ): Promise<TeamKPIEvolution> {
    return this.service.reject(companyId, id, approverUserId, reason);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}