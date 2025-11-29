import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';
import { CreateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/create-team-kpi-evolution.dto';
import { UpdateTeamKpiEvolutionDto } from '../dto/team-kpi-evolution/update-team-kpi-evolution.dto';
import { KpiStatus } from '../entities/kpi.enums';
import { Team } from '../../team/entities/team.entity';
import { TeamsService } from '../../team/teams.service';
import { TeamKpiEvolutionQueryDto } from '../dto/team-kpi-evolution/query-team-kpi-evolution.dto';

@Injectable()
export class TeamKpiEvolutionsService {
  constructor(
    @InjectRepository(TeamKPIEvolution) private readonly repo: Repository<TeamKPIEvolution>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    private readonly teamsService: TeamsService,
  ) {}

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

  async findAll(user: any, query: TeamKpiEvolutionQueryDto) {
    const where: any = { companyId: user.companyId };

    const team = await this.teamRepo.findOne({ where: { id: user.teamId, companyId: user.companyId } });
    const allChildTeams = await this.teamsService.findLowerTeamsRecursive(user.companyId, team!);
    where.teamId = In([...allChildTeams.map(t => t.id), user.teamId]);

    if (query?.status) where.status = query.status;

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });
    return { page, limit, total, data };
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