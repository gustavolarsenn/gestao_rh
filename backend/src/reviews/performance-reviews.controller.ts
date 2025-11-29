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
  Req,
} from '@nestjs/common';
import { PerformanceReviewsService, ReviewsFilters } from './performance-reviews.service';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';
import { PerformanceReview } from './entities/performance-review.entity';
import { PerformanceReviewQueryDto } from './dto/performance-review-query.dto';

@Controller('performance-reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PerformanceReviewsController {
  constructor(private readonly service: PerformanceReviewsService) {}

  @Post('employee')
  createToEmployee(
    @Req() req: any,
    @Body() dto: CreatePerformanceReviewDto
  ): Promise<PerformanceReview> {
    return this.service.createToEmployee(req.user, dto);
  }

  @Post('leader')
  createToLeader(
    @Req() req: any,
    @Body() dto: CreatePerformanceReviewDto
  ): Promise<PerformanceReview> {
    return this.service.createToLeader(req.user, dto);
  }

  @Get('employee')
  findAllToEmployee(
    @Req() req: any,
    @Query() query: PerformanceReviewQueryDto,
  ) {
    return this.service.findAllToEmployee(req.user, query);
  }

  @Get('leader')
  findAllToLeader(
    @Req() req: any,
    @Query() query: PerformanceReviewQueryDto,
  ) {
    return this.service.findAllToLeader(req.user, query);
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