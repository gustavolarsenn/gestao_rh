import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe, Req, ForbiddenException } from '@nestjs/common';
import { EmployeeKpisService } from './employee-kpis.service';
import { CreateEmployeeKpiDto } from '../dto/employee-kpi/create-employee-kpi.dto';
import { UpdateEmployeeKpiDto } from '../dto/employee-kpi/update-employee-kpi.dto';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { KpiStatus } from '../entities/kpi.enums';
import { EmployeeKPIQueryDto } from '../dto/employee-kpi/query-employee-kpi.dto';

@Controller('kpi/employee-kpis')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EmployeeKpisController {
  constructor(private readonly service: EmployeeKpisService) {}

  @Post()
  create(@Body() dto: CreateEmployeeKpiDto): Promise<EmployeeKPI> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query() query: EmployeeKPIQueryDto,
    @Req() req: any,
  ): Promise<EmployeeKPI[]> {
    const user = req.user;

    if (user.role === 'superAdmin') {
      return this.service.findAll(query);
    }

    if (user.role === 'admin') {
      return this.service.findByCompany(user.companyId, query);
    }

    if (user.role === 'manager') {
      return this.service.findByTeam(user.companyId, user.teamId, query);
    }

    if (user.role === 'employee') {
      return this.service.findByEmployee(user.companyId, user.id, query);
    }

    throw new ForbiddenException('Role não autorizada');    
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<EmployeeKPI> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateEmployeeKpiDto): Promise<EmployeeKPI> {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Query('approverUserId', ParseUUIDPipe) approverUserId: string): Promise<EmployeeKPI> {
    return this.service.approve(companyId, id, approverUserId);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('approverUserId', ParseUUIDPipe) approverUserId: string,
    @Body('reason') reason?: string,
  ): Promise<EmployeeKPI> {
    return this.service.reject(companyId, id, approverUserId, reason);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}