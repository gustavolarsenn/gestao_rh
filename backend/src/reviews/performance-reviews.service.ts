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
import { PerformanceReviewQueryDto } from './dto/performance-review-query.dto';
import { applyScope } from '../common/utils/scoped-query.util';

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

  async create(user: any, dto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const entity = this.repo.create({ leaderId: user.employeeId, ...dto } as Partial<PerformanceReview>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: PerformanceReviewQueryDto) {
    const where = applyScope(user, {}, { company: true, team: false, employee: true, department: false });

    if (query.startDate && query.endDate) {
      (where as any).date = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      (where as any).date = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      (where as any).date = LessThanOrEqual(query.endDate);
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });

    return { page, limit, total, data };
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