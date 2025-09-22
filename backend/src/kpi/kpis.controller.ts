import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';
import { KPI } from './entities/kpi.entity';

@Controller('kpi/kpis')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class KpisController {
  constructor(private readonly service: KpisService) {}

  @Post()
  create(@Body() dto: CreateKpiDto): Promise<KPI> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string): Promise<KPI[]> {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<KPI> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateKpiDto): Promise<KPI> {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}