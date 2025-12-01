import { Test } from '@nestjs/testing';
import { TeamKpisService } from './team-kpis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamKPI } from '../entities/team-kpi.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { KpiStatus } from '../entities/kpi.enums';
import { Team } from '../../team/entities/team.entity';
import { TeamsService } from '../../team/teams.service';

describe('TeamKpisService', () => {
  let service: TeamKpisService;
  let repo: jest.Mocked<Repository<TeamKPI>>;
  let teamRepo: jest.Mocked<Repository<Team>>;
  let teamsService: jest.Mocked<TeamsService>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((e1, e2) => ({ ...e1, ...e2 })),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  function mockTeamKpi(overrides: Partial<TeamKPI> = {}): TeamKPI {
    return {
      id: 'tk1',
      companyId: 'c1',
      teamId: 't1',
      kpiId: 'k1',
      evaluationTypeId: 'ev1',

      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',

      status: KpiStatus.SUBMITTED,
      submittedBy: 'u1',
      submittedDate: new Date(),

      team: {} as any,
      kpi: {} as any,
      evaluationType: {} as any,
      submittedByUser: {} as any,
      approvedByUser: null,
      company: {} as any,

      approvedBy: null,
      approvedDate: null,
      rejectionReason: null,
      goal: null,
      achievedValue: null,

      ...overrides,
    } as TeamKPI;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamKpisService,
        { provide: getRepositoryToken(TeamKPI), useValue: mockRepo() },
        { provide: getRepositoryToken(Team), useValue: mockRepo() },
        {
          provide: TeamsService,
          useValue: {
            findUpperTeamsRecursive: jest.fn().mockResolvedValue([]),
            findLowerTeamsRecursive: jest.fn().mockResolvedValue([]),
            validateMemberBelongsToTeam: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get(TeamKpisService);
    repo = module.get(getRepositoryToken(TeamKPI));
    teamRepo = module.get(getRepositoryToken(Team));
    teamsService = module.get(TeamsService);

    (teamRepo.findOne as jest.Mock).mockResolvedValue({
      id: 't1',
      companyId: 'c1',
    } as any);
    (teamsService.findLowerTeamsRecursive as jest.Mock).mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
    ] as any);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // ======================================================
  // CREATE
  // ======================================================
  it('create deve criar registro com status SUBMITTED se não vier no DTO', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      teamId: 't1',
      kpiId: 'k1',
      evaluationTypeId: 'ev1',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      submittedBy: 'u1',
    };

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.companyId).toBe('c1');
    expect(result.status).toBe(KpiStatus.SUBMITTED);
    expect(result.submittedDate).toBeInstanceOf(Date);
  });

  it('create deve respeitar submittedDate e status vindos do DTO', async () => {
    repo.findOne.mockResolvedValue(null);

    const customDate = new Date('2024-02-01T00:00:00Z');
    const dto: any = {
      companyId: 'c1',
      teamId: 't1',
      kpiId: 'k1',
      evaluationTypeId: 'ev1',
      periodStart: '2024-02-01',
      periodEnd: '2024-02-28',
      submittedBy: 'u1',
      submittedDate: customDate.toISOString(),
      status: KpiStatus.APPROVED,
    };

    const result = await service.create(dto);

    expect(result.submittedDate).toEqual(customDate);
    expect(result.status).toBe(KpiStatus.APPROVED);
  });

  it('create deve lançar erro se unique duplicado', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        teamId: 't1',
        kpiId: 'k1',
        evaluationTypeId: 'ev1',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ======================================================
  // FIND ALL
  // ======================================================
  it('findAll deve retornar paginado (showExpired undefined - branch padrão)', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'tk1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1', teamId: 't1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(teamRepo.findOne).toHaveBeenCalled();
    expect(teamsService.findLowerTeamsRecursive).toHaveBeenCalled();
    expect(repo.findAndCount).toHaveBeenCalled();

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'tk1' }],
    });

    const callArgs = repo.findAndCount.mock.calls[0]![0] as any;
    expect(callArgs.where.companyId).toBe('c1');
    // deve ter teamId como In([...children, user.teamId])
    expect(callArgs.where.teamId).toBeDefined();
  });

  it('findAll deve aplicar filtros quando showExpired = false', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'tk2' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1', teamId: 't1' } as any,
      {
        page: 2,
        limit: 5,
        showExpired: false,
        kpiId: 'k1',
        status: KpiStatus.SUBMITTED,
        teamId: 't-forced',
      } as any,
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);

    const callArgs = repo.findAndCount.mock.calls[0]![0] as any;
    const where = callArgs.where;

    expect(where.companyId).toBe('c1');
    expect(where.kpiId).toBe('k1');
    expect(where.status).toBe(KpiStatus.SUBMITTED);
    // como query.teamId foi passado, where.teamId deve ter sido sobrescrito
    expect(where.teamId).toBe('t-forced');
    expect(where.periodEnd).toBeDefined(); // MoreThan(...)
  });

  it('findAll deve aplicar filtro de período quando showExpired != false', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'tk3' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1', teamId: 't1' } as any,
      {
        page: 1,
        limit: 10,
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        kpiId: 'k2',
        status: KpiStatus.APPROVED,
      } as any,
    );

    expect(result.total).toBe(1);
    const callArgs = repo.findAndCount.mock.calls[0]![0] as any;
    const where = callArgs.where;

    expect(where.companyId).toBe('c1');
    expect(where.kpiId).toBe('k2');
    expect(where.status).toBe(KpiStatus.APPROVED);
    expect(where.periodStart).toBeDefined(); // Between(...)
    expect(where.teamId).toBeDefined();
  });

  // ======================================================
  // FIND BY COMPANY
  // ======================================================
  it('findByCompany deve retornar lista simples sem filtros', async () => {
    repo.find.mockResolvedValue([{ id: 'tk1' } as any]);

    const result = await service.findByCompany('c1', {} as any);

    expect(repo.find).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    const callArgs = repo.find.mock.calls[0]![0] as any;
    const where = callArgs.where;
    expect(where.companyId).toBe('c1');
    expect(where.kpiId).toBeUndefined();
    expect(where.status).toBeUndefined();
    expect(where.periodStart).toBeUndefined();
  });

  it('findByCompany deve aplicar filtros de kpiId, status e período', async () => {
    repo.find.mockResolvedValue([{ id: 'tk2' } as any]);

    const result = await service.findByCompany('c1', {
      kpiId: 'k1',
      status: KpiStatus.SUBMITTED,
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
    } as any);

    expect(result).toHaveLength(1);
    const callArgs = repo.find.mock.calls[0]![0] as any;
    const where = callArgs.where;
    expect(where.companyId).toBe('c1');
    expect(where.kpiId).toBe('k1');
    expect(where.status).toBe(KpiStatus.SUBMITTED);
    expect(where.periodStart).toBeDefined(); // Between(...)
  });

  // ======================================================
  // FIND BY TEAM
  // ======================================================
  it('findByTeam deve retornar KPIs filtrados por time', async () => {
    repo.find.mockResolvedValue([{ id: 'tk3' } as any]);

    const result = await service.findByTeam('c1', 't1', {} as any);

    expect(repo.find).toHaveBeenCalled();
    const callArgs = repo.find.mock.calls[0]![0] as any;
    const where = callArgs.where;
    expect(where.companyId).toBe('c1');
    expect(where.teamId).toBe('t1');
  });

  it('findByTeam deve aplicar filtros de kpiId, status e período', async () => {
    repo.find.mockResolvedValue([{ id: 'tk4' } as any]);

    const result = await service.findByTeam('c1', 't1', {
      kpiId: 'k1',
      status: KpiStatus.REJECTED,
      periodStart: '2024-02-01',
      periodEnd: '2024-02-29',
    } as any);

    expect(result).toHaveLength(1);
    const callArgs = repo.find.mock.calls[0]![0] as any;
    const where = callArgs.where;
    expect(where.companyId).toBe('c1');
    expect(where.teamId).toBe('t1');
    expect(where.kpiId).toBe('k1');
    expect(where.status).toBe(KpiStatus.REJECTED);
    expect(where.periodStart).toBeDefined(); // Between(...)
  });

  // ======================================================
  // FIND ONE
  // ======================================================
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'tk1' } as any);

    const result = await service.findOne('c1', 'tk1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'tk1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ======================================================
  // UPDATE
  // ======================================================
  it('update deve atualizar registro sem mudança de chaves únicas', async () => {
    // findOne da service (primeiro) -> row
    repo.findOne.mockResolvedValueOnce(mockTeamKpi());
    // como não há keysChange, não chama outro findOne
    const result = await service.update('c1', 'tk1', { goal: '50' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.goal).toBe('50');
  });

  it('update deve lançar erro se unique duplicado', async () => {
    // primeiro findOne (dentro de findOne service)
    repo.findOne.mockResolvedValueOnce(mockTeamKpi({ id: 'tk1' }));
    // segundo findOne (checagem de duplicidade)
    repo.findOne.mockResolvedValueOnce(mockTeamKpi({ id: 'other' }));

    await expect(
      service.update('c1', 'tk1', { teamId: 'other' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ======================================================
  // APPROVE
  // ======================================================
  it('approve deve aprovar quando status SUBMITTED', async () => {
    repo.findOne.mockResolvedValue(mockTeamKpi({ status: KpiStatus.SUBMITTED }));

    const result = await service.approve('c1', 'tk1', 'u1');

    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('approve deve retornar registro sem salvar se já estiver APPROVED', async () => {
    repo.findOne.mockResolvedValue(
      mockTeamKpi({ status: KpiStatus.APPROVED }),
    );

    const result = await service.approve('c1', 'tk1', 'u1');

    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('approve deve falhar se status REJECTED', async () => {
    repo.findOne.mockResolvedValue(mockTeamKpi({ status: KpiStatus.REJECTED }));

    await expect(
      service.approve('c1', 'tk1', 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ======================================================
  // REJECT
  // ======================================================
  it('reject deve rejeitar quando status SUBMITTED', async () => {
    repo.findOne.mockResolvedValue(mockTeamKpi({ status: KpiStatus.SUBMITTED }));

    const result = await service.reject('c1', 'tk1', 'u1', 'Bad');

    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(result.rejectionReason).toBe('Bad');
    expect(repo.save).toHaveBeenCalled();
  });

  it('reject deve retornar registro sem salvar se já estiver REJECTED', async () => {
    repo.findOne.mockResolvedValue(
      mockTeamKpi({ status: KpiStatus.REJECTED }),
    );

    const result = await service.reject('c1', 'tk1', 'u1', ' qualquer ');

    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('reject deve falhar se status APPROVED', async () => {
    repo.findOne.mockResolvedValue(
      mockTeamKpi({ status: KpiStatus.APPROVED }),
    );

    await expect(service.reject('c1', 'tk1', 'u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  // ======================================================
  // REMOVE
  // ======================================================
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue(mockTeamKpi());

    await service.remove('c1', 'tk1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
