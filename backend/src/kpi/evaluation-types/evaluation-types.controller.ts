import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { EvaluationTypesService } from './evaluation-types.service';
import { CreateEvaluationTypeDto } from '../dto/evaluation-type/create-evaluation-type.dto';
import { UpdateEvaluationTypeDto } from '../dto/evaluation-type/update-evaluation-type.dto';
import { EvaluationType } from '../entities/evaluation-type.entity';

@Controller('kpi/evaluation-types')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class EvaluationTypesController {
  constructor(private readonly service: EvaluationTypesService) {}

  @Post()
  create(@Body() dto: CreateEvaluationTypeDto): Promise<EvaluationType> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Req() req: any): Promise<EvaluationType[]> {
    return this.service.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<EvaluationType> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateEvaluationTypeDto): Promise<EvaluationType> {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}