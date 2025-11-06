import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe, Req, ForbiddenException } from '@nestjs/common';
import { TeamKpisService } from './team-kpis.service';
import { CreateTeamKpiDto } from '../dto/team-kpi/create-team-kpi.dto';
import { UpdateTeamKpiDto } from '../dto/team-kpi/update-team-kpi.dto';
import { TeamKPI } from '../entities/team-kpi.entity';
import { KpiStatus } from '../entities/kpi.enums';
import { TeamKPIQueryDto } from '../dto/team-kpi/query-team-kpi.dto';

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
    @Query() query: TeamKPIQueryDto,
    @Req() req: any,
  ): Promise<TeamKPI[]> {
const user = req.user;

    if (user.role === 'superAdmin') {
      return this.service.findAll(query);
    }

    if (user.role === 'admin') {
      return this.service.findByCompany(user.companyId, query);
    }

    if (user.role === 'gestor') {
      return this.service.findByTeam(user.companyId, user.teamId, query);
    }

    throw new ForbiddenException('Role não autorizada');  
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