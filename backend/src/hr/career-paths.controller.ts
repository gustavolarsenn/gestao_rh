import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CareerPathsService } from './career-paths.service';
import { CreateCareerPathDto } from './dto/create-career-path.dto';
import { UpdateCareerPathDto } from './dto/update-career-path.dto';

@Controller('career-paths')
export class CareerPathsController {
  constructor(private readonly careerPathsService: CareerPathsService) {}

  @Post()
  create(@Body() dto: CreateCareerPathDto) {
    return this.careerPathsService.create(dto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('departmentId') departmentId?: string,
    @Query('currentRoleId') currentRoleId?: string,
  ) {
    return this.careerPathsService.findAll(companyId, {
      departmentId,
      currentRoleId,
    });
  }

  @Get(':id')
  findOne(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.careerPathsService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCareerPathDto,
  ) {
    return this.careerPathsService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.careerPathsService.remove(companyId, id);
  }
}
