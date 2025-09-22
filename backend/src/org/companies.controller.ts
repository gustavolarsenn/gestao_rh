import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

import { Public } from '../auth/decorators/public.decorator';

@Controller('companies')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Company[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Company> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto): Promise<Company> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}