import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PerformanceReviewsService, ReviewsFilters } from './performance-reviews.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { PerformanceReview } from './entities/performance-review.entity';

@Controller('performance-reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PerformanceReviewsController {
  constructor(private readonly service: PerformanceReviewsService) {}

  @Post()
  create(@Body() dto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('leaderId') leaderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PerformanceReview[]> {
    const filters: ReviewsFilters = { employeeId, leaderId, startDate, endDate };
    return this.service.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
  ): Promise<PerformanceReview> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdatePerformanceReviewDto,
  ): Promise<PerformanceReview> {
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