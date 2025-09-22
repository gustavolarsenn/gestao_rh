import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
  import { CareerPathsService } from './career-paths.service';
import { CreateCareerPathDto } from './dto/create-career-path.dto';
import { UpdateCareerPathDto } from './dto/update-career-path.dto';
import { CareerPath } from './entities/career-path.entity';

@Controller('career-paths')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CareerPathsController {
  constructor(private readonly service: CareerPathsService) {}

  @Post()
  create(@Body() dto: CreateCareerPathDto): Promise<CareerPath> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string): Promise<CareerPath[]> {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<CareerPath> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateCareerPathDto,
  ): Promise<CareerPath> {
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