import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';

export type ReviewsFilters = {
  employeeId?: string;
  leaderId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
};

@Injectable()
export class PerformanceReviewsService {
  constructor(
    @InjectRepository(PerformanceReview)
    private readonly repo: Repository<PerformanceReview>,
  ) {}

  async create(dto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const entity = this.repo.create(dto as Partial<PerformanceReview>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, filters: ReviewsFilters = {}): Promise<PerformanceReview[]> {
    const where: FindOptionsWhere<PerformanceReview> = { companyId };

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.leaderId) where.leaderId = filters.leaderId;

    if (filters.startDate && filters.endDate) {
      (where as any).date = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      (where as any).date = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      (where as any).date = LessThanOrEqual(filters.endDate);
    }

    return this.repo.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<PerformanceReview> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Performance review not found');
    return row;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdatePerformanceReviewDto,
  ): Promise<PerformanceReview> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}