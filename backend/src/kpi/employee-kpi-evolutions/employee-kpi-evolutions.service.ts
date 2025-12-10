import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { CreateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/create-employee-kpi-evolution.dto';
import { UpdateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/update-employee-kpi-evolution.dto';
import { KpiStatus } from '../entities/kpi.enums';
import { EmployeeKPIEvolution } from '../entities/employee-kpi-evolution.entity';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { TeamKPI } from '../entities/team-kpi.entity';
import { applyScope } from '../../common/utils/scoped-query.util';
import { TeamsService } from '../../team/teams.service';
import { Team } from '../../team/entities/team.entity';
import { EmployeeKpiEvolutionQueryDto } from '../dto/employee-kpi-evolution/employee-kpi-evolution-query.dto';
import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';
import { parse } from 'path';

@Injectable()
    export class EmployeeKpiEvolutionsService {
      constructor(
    @InjectRepository(EmployeeKPIEvolution) private readonly repo: Repository<EmployeeKPIEvolution>,
    @InjectRepository(EmployeeKPI) private readonly employeeKpiRepo: Repository<EmployeeKPI>,
    @InjectRepository(TeamKPI) private readonly teamKpiRepo: Repository<TeamKPI>,
    @InjectRepository(TeamKPIEvolution) private readonly teamKpiEvolutionRepo: Repository<TeamKPIEvolution>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    private readonly teamsService: TeamsService,
  ) {}

  async create(dto: CreateEmployeeKpiEvolutionDto, req: any): Promise<EmployeeKPIEvolution> {
    const user = req.user;
    
    // const exists = await this.repo.findOne({
    //   where: {
    //     companyId: user.companyId,
    //     employeeId: user.employeeId,
    //     employeeKpiId: dto.employeeKpiId,
    //     submittedDate: new Date(),
    //     submittedBy: user.id,
    //   } as any,
    // });
    // if (exists) throw new ConflictException('An EmployeeKPIEvolution for this period already exists.');
    const existsBinary = await this.repo.findOne({
      where: {
        companyId: user.companyId,
        employeeId: user.employeeId,
        teamId: user.teamId,
        employeeKpiId: dto.employeeKpiId,
        employeeKpi: { kpi: { evaluationType: { code: 'BINARY' } } }
      } as any,
      relations: ['employeeKpi', 'employeeKpi.kpi', 'employeeKpi.kpi.evaluationType'],
    });
    if (existsBinary) throw new ConflictException('An EmployeeKPIEvolution for this KPI already exists.');
    
    const employeeKpi = await this.employeeKpiRepo.findOne({
      where: {
        companyId: user.companyId,
        id: dto.employeeKpiId,
      } as any,
      relations: ['kpi', 'kpi.evaluationType'],
    });
    if (!employeeKpi) throw new NotFoundException('EmployeeKPI not found for creating evolution.');

    const entity = this.repo.create({
      companyId: employeeKpi.companyId,
      employeeId: employeeKpi.employeeId,
      teamId: employeeKpi.teamId,
      submittedBy: user.id,
      submittedDate: new Date(),
       ...dto
      } as Partial<EmployeeKPIEvolution>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: EmployeeKpiEvolutionQueryDto) {
    const where = applyScope(user, {}, { company: true, team: true, employee: true, department: false });

    const team = await this.teamRepo.findOne({ where: { id: user.teamId, companyId: user.companyId } });
    const allChildTeams = await this.teamsService.findLowerTeamsRecursive(user.companyId, team!);
    if (user.level <= 2) {
      where.teamId = In([...allChildTeams.map(t => t.id), user.teamId]);
    }

    if (query?.status) where.status = query.status;

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['employee', 'employee.person', 'employeeKpi'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findAllEmployee(user: any, query: EmployeeKpiEvolutionQueryDto) {
    const where = { companyId: user.companyId, employeeId: user.employeeId } as any;
    if (query?.status) where.status = query.status;

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['employee', 'employee.person', 'employeeKpi', 'employeeKpi.kpi', 'employeeKpi.kpi.evaluationType'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findOne(companyId: string, id: string): Promise<EmployeeKPIEvolution> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['employee', 'employee.person', 'employeeKpi', 'employeeKpi.kpi', 'employeeKpi.kpi.evaluationType'] });
    if (!row) throw new NotFoundException('EmployeeKPI not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeKpiEvolutionDto): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);

    // se mudar chaves da unique, checar duplicidade
    const keysChange =
      // (dto.employeeId && dto.employeeId !== row.employeeId) ||
      (dto.employeeKpiId && dto.employeeKpiId !== row.employeeKpiId) ||
      (dto.submittedDate && dto.submittedDate !== row.submittedDate)

    if (keysChange) {
      const dup = await this.repo.findOne({
        where: {
          // companyId: dto.companyId ?? row.companyId,
          // employeeId: dto.employeeId ?? row.employeeId,
          employeeKpiId: dto.employeeKpiId ?? row.employeeKpiId,
          submittedDate: dto.submittedDate ?? row.submittedDate,
        } as any,
        relations: ['evaluationType'],
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Another EmployeeKPI exists with the same unique keys.');
      }
    }
    
    const merged = this.repo.merge(row, dto as any);

    return this.repo.save(merged);
  }

  private async applyEvolutionUpperTeams(user: any, companyId: string, kpiEvolution: EmployeeKPIEvolution): Promise<void> {
    const team = await this.teamRepo.findOne({ where: { companyId, id: kpiEvolution.teamId } });

    if (!team) {
      return;
    }
    const upperTeams = await this.teamsService.findUpperTeamsRecursive(companyId, team);
    for (const upperTeam of upperTeams) {
      const teamKpi = await this.teamKpiRepo.findOne({
        where: {  companyId, teamId: upperTeam.id, kpiId: kpiEvolution.employeeKpi.kpiId } as any,
      });

      if (teamKpi) {
        let newAchievedValue: string;
        if (['BINARY'].includes(kpiEvolution.employeeKpi.kpi.evaluationType.code)) {
          newAchievedValue = kpiEvolution.achievedValueEvolution!;
        }
        if (['LOWER_BETTER_PCT', 'HIGHER_BETTER_PCT'].includes(kpiEvolution.employeeKpi.kpi.evaluationType.code)) {
          const latestEvolutions = await this.teamKpiEvolutionRepo.find({
            where: {
              companyId,
              teamKpiId: teamKpi.id,
            },
            order: { submittedDate: 'DESC' },
          });
          if (latestEvolutions.length > 0) {
            let sum = latestEvolutions.reduce((acc, ev) => acc + parseFloat(ev.achievedValueEvolution ?? '0'), 0);
            sum += parseFloat(kpiEvolution.achievedValueEvolution!);
            newAchievedValue = (sum / (latestEvolutions.length + 1)).toString();
          }
        }
        if (['LOWER_BETTER_SUM', 'HIGHER_BETTER_SUM'].includes(kpiEvolution.employeeKpi.kpi.evaluationType.code)) {
          const currentValue = parseFloat(teamKpi.achievedValue ?? '0');
          const evolutionValue = parseFloat(kpiEvolution.achievedValueEvolution ?? '0');
          newAchievedValue = (currentValue + evolutionValue).toString();

          if (kpiEvolution.employeeKpi.kpi.evaluationType.code === 'HIGHER_BETTER_SUM' && parseFloat(newAchievedValue) > parseFloat(teamKpi.goal!)) {
            teamKpi.status = KpiStatus.APPROVED;
          }
        }
        teamKpi.achievedValue = newAchievedValue!;
        await this.teamKpiEvolutionRepo.save({
          companyId: kpiEvolution.companyId,
          teamId: teamKpi.teamId,
          teamKpiId: teamKpi.id,
          achievedValueEvolution: kpiEvolution.achievedValueEvolution,
          submittedBy: user.id,
          submittedDate: new Date(),
          approvedBy: user.id,
          approvedDate: new Date(),
          status: KpiStatus.APPROVED,
          employeeKpiId: kpiEvolution.employeeKpi.id,
        });
        await this.teamKpiRepo.save(teamKpi);
      }
    }
    return;
  }

  async approve(companyId: string, id: string, req: any): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);
    const user = req.user;
    if (row.status === KpiStatus.APPROVED) return row;
    if (row.status === KpiStatus.REJECTED) throw new BadRequestException('Cannot approve a rejected KPI.');

    let approvedExists = await this.employeeKpiRepo.findOne({
      where: {
        companyId,
        employeeId: row.employeeId,
        id: row.employeeKpiId,
      } as any,
    });

    if (approvedExists) {
      approvedExists.rejectionReason = null;
      
        if (['BINARY'].includes(row.employeeKpi.kpi.evaluationType.code)) {
          approvedExists.achievedValue = row.achievedValueEvolution!;
          if (approvedExists.achievedValue === approvedExists.goal) {
            approvedExists.status = KpiStatus.APPROVED;
          }
        }
        if (['LOWER_BETTER_PCT', 'HIGHER_BETTER_PCT'].includes(row.employeeKpi.kpi.evaluationType.code)) {
          const latestEvolutions = await this.teamKpiEvolutionRepo.find({
            where: {
              companyId,
              teamKpiId: approvedExists.id,
            },
            order: { submittedDate: 'DESC' },
          });
          if (latestEvolutions.length > 0) {
            let sum = latestEvolutions.reduce((acc, ev) => acc + parseFloat(ev.achievedValueEvolution ?? '0'), 0);
            sum += parseFloat(row.achievedValueEvolution!);
            approvedExists.achievedValue = (sum / (latestEvolutions.length + 1)).toString();
          }
        }
      if (['LOWER_BETTER_SUM', 'HIGHER_BETTER_SUM'].includes(row.employeeKpi.kpi.evaluationType.code)) {
        const currentValue = parseFloat(approvedExists.achievedValue ?? '0');
        const evolutionValue = parseFloat(row.achievedValueEvolution ?? '0');
        approvedExists.achievedValue = (currentValue + evolutionValue).toString();

        if (row.employeeKpi.kpi.evaluationType.code === 'HIGHER_BETTER_SUM' && parseFloat(approvedExists.achievedValue) > parseFloat(approvedExists.goal!)) {
          approvedExists.status = KpiStatus.APPROVED;
        }
      }

      await this.employeeKpiRepo.save(approvedExists);
    }

    let approvedTeamKpiExists = await this.teamKpiRepo.findOne({
      where: {
        companyId,
        periodStart: approvedExists?.periodStart,
        periodEnd: approvedExists?.periodEnd,
        teamId: row.employee.teamId,
        kpiId: row.employeeKpi.kpiId,
      } as any,
    });
    if (approvedTeamKpiExists) {
      approvedTeamKpiExists.rejectionReason = null;

      if (['BINARY', 'LOWER_BETTER_PCT', 'HIGHER_BETTER_PCT'].includes(row.employeeKpi.kpi.evaluationType.code)) {
        approvedTeamKpiExists.achievedValue = row.achievedValueEvolution;
      }
      if (['LOWER_BETTER_SUM', 'HIGHER_BETTER_SUM'].includes(row.employeeKpi.kpi.evaluationType.code)) {
        const currentValue = parseFloat(approvedTeamKpiExists.achievedValue ?? '0');
        const evolutionValue = parseFloat(row.achievedValueEvolution ?? '0');
        approvedTeamKpiExists.achievedValue = (currentValue + evolutionValue).toString();

        if (row.employeeKpi.kpi.evaluationType.code === 'HIGHER_BETTER_SUM' && parseFloat(approvedTeamKpiExists.achievedValue) > parseFloat(approvedTeamKpiExists.goal!)) {
          approvedTeamKpiExists.status = KpiStatus.APPROVED;
        }
      }
      
      await this.teamKpiEvolutionRepo.save({
        companyId: row.companyId,
        teamId: approvedTeamKpiExists.teamId,
        teamKpiId: approvedTeamKpiExists.id,
        achievedValueEvolution: row.achievedValueEvolution,
        submittedBy: user.id,
        submittedDate: new Date(),
        approvedBy: user.id,
        approvedDate: new Date(),
        status: KpiStatus.APPROVED,
        employeeKpiId: row.employeeKpiId,
      });
      await this.teamKpiRepo.save(approvedTeamKpiExists);
    }

    await this.applyEvolutionUpperTeams(user, companyId, row);
    
    row.status = KpiStatus.APPROVED;
    row.approvedBy = user.id;
    row.approvedDate = new Date();
    return this.repo.save(row);
  }

  async reject(companyId: string, id: string, req: any, reason?: string): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);
    const user = req.user;
    if (row.status === KpiStatus.REJECTED) return row;
    if (row.status === KpiStatus.APPROVED) throw new BadRequestException('Cannot reject an approved KPI.');

        if (row.employeeKpi.kpi.evaluationType.code == 'BINARY') {
      const approvedExists = await this.employeeKpiRepo.findOne({
        where: {
          companyId,
          employeeId: row.employeeId,
          id: row.employeeKpiId,
        } as any,
      });
      if (approvedExists) {
        approvedExists.status = KpiStatus.REJECTED;
        approvedExists.approvedDate = new Date();
        approvedExists.approvedBy = user.id;
        approvedExists.rejectionReason = reason ?? null;

        await this.employeeKpiRepo.save(approvedExists);
      }
    }

    row.status = KpiStatus.REJECTED;
    row.approvedBy = user.id;
    row.approvedDate = new Date();
    row.rejectionReason = reason ?? null;
    return this.repo.save(row);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}