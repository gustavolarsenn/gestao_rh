import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { TeamKpisService } from './team-kpis.service';
import { CreateTeamKpiDto } from '../dto/team-kpi/create-team-kpi.dto';
import { UpdateTeamKpiDto } from '../dto/team-kpi/update-team-kpi.dto';
import { TeamKPI } from '../entities/team-kpi.entity';
import { KpiStatus } from '../entities/kpi.enums';

@Controller('kpi/team-kpis')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TeamKpisController {
  constructor(private readonly service: TeamKpisService) {}

  @Post()
  create(@Body() dto: CreateTeamKpiDto): Promise<TeamKPI> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('teamId') teamId?: string,
    @Query('kpiId') kpiId?: string,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
    @Query('status') status?: KpiStatus,
  ): Promise<TeamKPI[]> {
    return this.service.findAll(companyId, { teamId, kpiId, periodStart, periodEnd, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<TeamKPI> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateTeamKpiDto): Promise<TeamKPI> {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Query('approverUserId', ParseUUIDPipe) approverUserId: string): Promise<TeamKPI> {
    return this.service.approve(companyId, id, approverUserId);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('approverUserId', ParseUUIDPipe) approverUserId: string,
    @Body('reason') reason?: string,
  ): Promise<TeamKPI> {
    return this.service.reject(companyId, id, approverUserId, reason);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}