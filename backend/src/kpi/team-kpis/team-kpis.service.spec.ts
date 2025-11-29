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
import { Team } from '../../team/entities/team.entity';      // ✅ NOVO
import { TeamsService } from '../../team/teams.service';     // ✅ NOVO

describe('TeamKpisService', () => {
  let service: TeamKpisService;
  let repo: jest.Mocked<Repository<TeamKPI>>;

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

  function mockTeam(overrides: Partial<TeamKPI> = {}): TeamKPI {
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
        { provide: getRepositoryToken(Team), useValue: mockRepo() }, // ✅ repo de Team
        {
          provide: TeamsService,                                     // ✅ mock TeamsService
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
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar registro', async () => {
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

  // FIND ALL
  it('findAll deve retornar paginado', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'tk1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'tk1' }],
    });
  });

  // FIND ONE
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

  // UPDATE
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValueOnce(mockTeam());
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 'tk1', { goal: '50' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.goal).toBe('50');
  });

  it('update deve lançar erro se unique duplicado', async () => {
    repo.findOne.mockResolvedValueOnce(mockTeam({ id: 'tk1' }));
    repo.findOne.mockResolvedValueOnce(mockTeam({ id: 'other' }));

    await expect(
      service.update('c1', 'tk1', { teamId: 'other' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // APPROVE
  it('approve deve aprovar', async () => {
    repo.findOne.mockResolvedValue(mockTeam({ status: KpiStatus.SUBMITTED }));

    const result = await service.approve('c1', 'tk1', 'u1');

    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('approve deve falhar se rejeitado', async () => {
    repo.findOne.mockResolvedValue(mockTeam({ status: KpiStatus.REJECTED }));

    await expect(
      service.approve('c1', 'tk1', 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // REJECT
  it('reject deve rejeitar', async () => {
    repo.findOne.mockResolvedValue(mockTeam({ status: KpiStatus.SUBMITTED }));

    const result = await service.reject('c1', 'tk1', 'u1', 'Bad');

    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(result.rejectionReason).toBe('Bad');
  });

  it('reject deve falhar se aprovado', async () => {
    repo.findOne.mockResolvedValue(mockTeam({ status: KpiStatus.APPROVED }));

    await expect(service.reject('c1', 'tk1', 'u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue(mockTeam());

    await service.remove('c1', 'tk1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
