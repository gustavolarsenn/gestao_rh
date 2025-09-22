import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { EmployeeHistoriesService } from './employee-histories.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
import { EmployeeHistory } from './entities/employee-history.entity';

@Controller('employee-histories')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EmployeeHistoriesController {
  constructor(private readonly service: EmployeeHistoriesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeHistoryDto): Promise<EmployeeHistory> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('employeeId') employeeId?: string,
  ): Promise<EmployeeHistory[]> {
    return this.service.findAll(companyId, employeeId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<EmployeeHistory> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateEmployeeHistoryDto,
  ): Promise<EmployeeHistory> {
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