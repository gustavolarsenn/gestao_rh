// src/org/departments.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Controller('departments')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  create(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string): Promise<Department[]> {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<Department> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateDepartmentDto): Promise<Department> {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}