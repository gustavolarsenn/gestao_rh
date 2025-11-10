import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { EmployeeKpiEvolutionsService } from './employee-kpi-evolutions.service';
import { CreateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/create-employee-kpi-evolution.dto';
import { UpdateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/update-employee-kpi-evolution.dto';
import { EmployeeKPIEvolution } from '../entities/employee-kpi-evolution.entity';
import { KpiStatus } from '../entities/kpi.enums';

@Controller('kpi/employee-kpi-evolutions')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EmployeeKpiEvolutionsController {
  constructor(private readonly service: EmployeeKpiEvolutionsService) {}

  @Post()
  create(@Body() dto: CreateEmployeeKpiEvolutionDto, @Req() req: any): Promise<EmployeeKPIEvolution> {
    return this.service.create(dto, req);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('employeeKpiId') employeeKpiId?: string,
    @Query('status') status?: KpiStatus,
  ): Promise<EmployeeKPIEvolution[]> {
    return this.service.findAll(req.user, { employeeId, employeeKpiId, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<EmployeeKPIEvolution> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateEmployeeKpiEvolutionDto): Promise<EmployeeKPIEvolution> {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Req() req: any): Promise<EmployeeKPIEvolution> {
    return this.service.approve(companyId, id, req);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Req() req: any,
    @Body('reason') reason?: string,
  ): Promise<EmployeeKPIEvolution> {
    return this.service.reject(companyId, id, req, reason);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}