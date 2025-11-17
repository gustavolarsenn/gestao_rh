import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TeamKPI } from '../entities/team-kpi.entity';
import { CreateTeamKpiDto } from '../dto/team-kpi/create-team-kpi.dto';
import { UpdateTeamKpiDto } from '../dto/team-kpi/update-team-kpi.dto';
import { KpiStatus } from '../entities/kpi.enums';
import { TeamKPIQueryDto } from '../dto/team-kpi/query-team-kpi.dto';
import { applyScope } from '../../common/utils/scoped-query.util';

@Injectable()
export class TeamKpisService {
  constructor(@InjectRepository(TeamKPI) private readonly repo: Repository<TeamKPI>) {}

  async create(dto: CreateTeamKpiDto): Promise<TeamKPI> {
    const exists = await this.repo.findOne({
      where: {
        companyId: dto.companyId,
        teamId: dto.teamId,
        kpiId: dto.kpiId,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
      } as any,
    });
    if (exists) throw new ConflictException('A TeamKPI for this period already exists.');

    const now = dto['submittedDate'] ? new Date(dto['submittedDate']) : new Date();
    const entity = this.repo.create({ ...(dto as Partial<TeamKPI>), submittedDate: now });
    if (!('status' in entity) || !entity['status']) (entity as any).status = KpiStatus.SUBMITTED;
    return this.repo.save(entity);
  }

  async findAll(user: any, query: TeamKPIQueryDto) {
    const where = applyScope(user, {}, { company: true, team: true, employee: false, department: false });
    console.log(query)
    if (query?.kpiId) where.kpiId = query.kpiId;
    if (query?.status) where.status = query.status;
    if (query?.teamId) where.teamId = query.teamId;
    if (query?.periodStart && query?.periodEnd) {
      where.periodStart = Between(query.periodStart, query.periodEnd);
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['team', 'kpi'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findByCompany(companyId: string, query: TeamKPIQueryDto): Promise<TeamKPI[]> {
    const where: any = { companyId };

    if (query?.kpiId) where.kpiId = query.kpiId;
    if (query?.status) where.status = query.status;

    if (query?.periodStart && query?.periodEnd) {
      where.periodStart = Between(query.periodStart, query.periodEnd);
    }

    return this.repo.find({ where, relations: ['team', 'kpi'] });
  }

  async findByTeam(companyId: string, teamId: string, query: TeamKPIQueryDto): Promise<TeamKPI[]> {
    const where: any = { companyId, teamId };

    if (query?.kpiId) where.kpiId = query.kpiId;
    if (query?.status) where.status = query.status;

    if (query?.periodStart && query?.periodEnd) {
      where.periodStart = Between(query.periodStart, query.periodEnd);
    }

    return this.repo.find({ where, relations: ['team', 'kpi'] });
  }

  async findOne(companyId: string, id: string): Promise<TeamKPI> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['team', 'kpi', 'kpi.evaluationType'] });
    if (!row) throw new NotFoundException('TeamKPI not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateTeamKpiDto): Promise<TeamKPI> {
    const row = await this.findOne(companyId, id);

    const keysChange =
      (dto.teamId && dto.teamId !== row.teamId) ||
      (dto.kpiId && dto.kpiId !== row.kpiId) ||
      (dto.periodStart && dto.periodStart !== row.periodStart) ||
      (dto.periodEnd && dto.periodEnd !== row.periodEnd)

    if (keysChange) {
      const dup = await this.repo.findOne({
        where: {
          companyId: dto.companyId ?? row.companyId,
          teamId: dto.teamId ?? row.teamId,
          kpiId: dto.kpiId ?? row.kpiId,
          periodStart: dto.periodStart ?? row.periodStart,
          periodEnd: dto.periodEnd ?? row.periodEnd,
        } as any,
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Another TeamKPI exists with the same unique keys.');
      }
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async approve(companyId: string, id: string, approverUserId: string): Promise<TeamKPI> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.APPROVED) return row;
    if (row.status === KpiStatus.REJECTED) throw new BadRequestException('Cannot approve a rejected KPI.');

    row.status = KpiStatus.APPROVED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    return this.repo.save(row);
  }

  async reject(companyId: string, id: string, approverUserId: string, reason?: string): Promise<TeamKPI> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.REJECTED) return row;
    if (row.status === KpiStatus.APPROVED) throw new BadRequestException('Cannot reject an approved KPI.');

    row.status = KpiStatus.REJECTED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    row.rejectionReason = reason ?? null;
    return this.repo.save(row);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}