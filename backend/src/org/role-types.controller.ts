import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
  Req,
} from '@nestjs/common';
import { RoleTypesService } from './role-types.service';
import { CreateRoleTypeDto } from './dto/create-role-type.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';
import { RoleType } from './entities/role-type.entity';
import { RoleTypeQueryDto } from './dto/role-type-query.dto';

@Controller('role-types')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RoleTypesController {
  constructor(private readonly service: RoleTypesService) {}

  @Post()
  create(@Body() dto: CreateRoleTypeDto): Promise<RoleType> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: RoleTypeQueryDto) {
    return this.service.findAll(req.user, query);
  }

  @Get('/distinct')
  findDistinct(@Req() req: any): Promise<RoleType[]> {
    return this.service.findDistinctRoleTypes(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<RoleType> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string, @Body() dto: UpdateRoleTypeDto): Promise<RoleType> {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Query('companyId', ParseUUIDPipe) companyId: string): Promise<void> {
    return this.service.remove(companyId, id);
  }
}