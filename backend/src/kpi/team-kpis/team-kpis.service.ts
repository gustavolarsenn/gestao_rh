import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TeamKPI } from '../entities/team-kpi.entity';
import { CreateTeamKpiDto } from '../dto/team-kpi/create-team-kpi.dto';
import { UpdateTeamKpiDto } from '../dto/team-kpi/update-team-kpi.dto';
import { KpiStatus } from '../entities/kpi.enums';

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

  async findAll(companyId: string, filters?: {
    teamId?: string;
    kpiId?: string;
    periodStart?: string;
    periodEnd?: string;
    status?: KpiStatus;
  }): Promise<TeamKPI[]> {
    const where: any = { companyId };

    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.kpiId) where.kpiId = filters.kpiId;
    if (filters?.status) where.status = filters.status;

    if (filters?.periodStart && filters?.periodEnd) {
      where.periodStart = Between(filters.periodStart, filters.periodEnd);
    }

    return this.repo.find({ where });
  }

  async findOne(companyId: string, id: string): Promise<TeamKPI> {
    const row = await this.repo.findOne({ where: { companyId, id } });
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