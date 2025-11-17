// src/org/branches.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
  Req,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';
import { branchQueryDto } from './dto/branch-query.dto';

@Controller('branches')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class BranchesController {
  constructor(private readonly service: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto): Promise<Branch> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: branchQueryDto) {
    return this.service.findAll(req.user, query);
  }

  @Get('/distinct')
  findDistinct(@Req() req: any) {
    return this.service.findDistinctBranches(req.user);
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