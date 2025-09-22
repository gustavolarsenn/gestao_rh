// src/org/branches.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';

@Controller('branches')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto): Promise<Branch> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string): Promise<Branch[]> {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<Branch> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<Branch> {
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