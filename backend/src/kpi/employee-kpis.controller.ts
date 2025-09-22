import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { EmployeeKpisService } from './employee-kpis.service';
import { CreateEmployeeKpiDto } from './dto/create-employee-kpi.dto';
import { UpdateEmployeeKpiDto } from './dto/update-employee-kpi.dto';
import { EmployeeKPI } from './entities/employee-kpi.entity';
import { KpiStatus } from './entities/kpi.enums';

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
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('kpiId') kpiId?: string,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
    @Query('status') status?: KpiStatus,
  ): Promise<EmployeeKPI[]> {
    return this.service.findAll(companyId, { employeeId, kpiId, periodStart, periodEnd, status });
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