import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';

@Controller('teams')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto): Promise<Team> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('companyId', ParseUUIDPipe) companyId: string): Promise<Team[]> {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<Team> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<Team> {
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