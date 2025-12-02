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
import { TeamMember } from '../team/entities/team-member.entity';

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
    @InjectRepository(TeamMember) private readonly teamMemberRepo: Repository<TeamMember>,
  ) {}

  async createToEmployee(user: any, dto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const entity = this.repo.create({ leaderId: user.employeeId, employeeToLeader: false, ...dto } as Partial<PerformanceReview>);
    return this.repo.save(entity);
  }

  async createToLeader(user: any, dto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const leaderMember = await this.teamMemberRepo.findOne({ where: { teamId: user.teamId, isLeader: true, active: true } });
    const entity = this.repo.create({ leaderId: leaderMember?.employeeId, employeeToLeader: true, employeeId: user.employeeId, ...dto } as Partial<PerformanceReview>);
    return this.repo.save(entity);
  }

  async findAllToEmployee(user: any, query: PerformanceReviewQueryDto) {
    let where;
    if (query.leaderView) {
        where = applyScope(user, {}, { company: true, team: true, employee: true, department: false }, 'performanceReviewEmployeeLeaderView');
    } else {
        where = applyScope(user, {}, { company: true, team: true, employee: true, department: false }, 'performanceReviewEmployee');
    }

    if (query.startDate && query.endDate) {
      (where as any).date = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      (where as any).date = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      (where as any).date = LessThanOrEqual(query.endDate);
    }

    where['employeeToLeader'] = false;
    
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });

    return { page, limit, total, data };
  }

  async findAllToLeader(user: any, query: PerformanceReviewQueryDto) {
    const where = applyScope(user, {}, { company: true, team: true, employee: false, department: false }, 'performanceReviewLeader');
    if (query.startDate && query.endDate) {
      (where as any).date = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      (where as any).date = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      (where as any).date = LessThanOrEqual(query.endDate);
    }

    where['employeeToLeader'] = true;
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['employee', 'employee.person'], skip, take: limit });
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