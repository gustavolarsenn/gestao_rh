import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';
import { CreateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/create-team-kpi-evolution.dto';
import { UpdateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/update-team-kpi-evolution.dto';
import { KpiStatus } from '../entities/kpi.enums';

@Injectable()
export class TeamKpiEvolutionsService {
  constructor(@InjectRepository(TeamKPIEvolution) private readonly repo: Repository<TeamKPIEvolution>) {}

  async create(dto: CreateTeamKpiEvolutionDto): Promise<TeamKPIEvolution> {
    const exists = await this.repo.findOne({
      where: {
        companyId: dto.companyId,
        teamId: dto.teamId,
        teamKpiId: dto.teamKpiId,
        submittedDate: dto.submittedDate,
      } as any,
    });
    if (exists) throw new ConflictException('A TeamKPI for this period already exists.');

    const entity = this.repo.create({ ...(dto as Partial<TeamKPIEvolution>) });
    if (!('status' in entity) || !entity['status']) (entity as any).status = KpiStatus.SUBMITTED;
    return this.repo.save(entity);
  }

  async findAll(companyId: string, filters?: {
    teamId?: string;
    teamKpiId?: string;
    submittedDate?: string;
    status?: KpiStatus;
  }): Promise<TeamKPIEvolution[]> {
    const where: any = { companyId };

    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.teamKpiId) where.teamKpiId = filters.teamKpiId;
    if (filters?.status) where.status = filters.status;


    return this.repo.find({ where });
  }

  async findOne(companyId: string, id: string): Promise<TeamKPIEvolution> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('TeamKPIEvolution not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateTeamKpiEvolutionDto): Promise<TeamKPIEvolution> {
    const row = await this.findOne(companyId, id);

    const keysChange =
      (dto.teamId && dto.teamId !== row.teamId) ||
      (dto.teamKpiId && dto.teamKpiId !== row.teamKpiId) ||
      (dto.submittedDate && dto.submittedDate !== row.submittedDate)

    if (keysChange) {
      const dup = await this.repo.findOne({
        where: {
          companyId: dto.companyId ?? row.companyId,
          teamId: dto.teamId ?? row.teamId,
          teamKpiId: dto.teamKpiId ?? row.teamKpiId,
          submittedDate: dto.submittedDate ?? row.submittedDate,
        } as any,
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Another TeamKPI exists with the same unique keys.');
      }
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async approve(companyId: string, id: string, approverUserId: string): Promise<TeamKPIEvolution> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.APPROVED) return row;
    if (row.status === KpiStatus.REJECTED) throw new BadRequestException('Cannot approve a rejected KPI.');

    row.status = KpiStatus.APPROVED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    return this.repo.save(row);
  }

  async reject(companyId: string, id: string, approverUserId: string, reason?: string): Promise<TeamKPIEvolution> {
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