import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
  Req,
} from '@nestjs/common';
import { EmployeeHistoriesService } from './employee-histories.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeHistoryQueryDto } from './dto/employee-history-query.dto';

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
    @Req() req: any,
    @Query() query: EmployeeHistoryQueryDto
  ) {
    return this.service.findAll(req.user, query);
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