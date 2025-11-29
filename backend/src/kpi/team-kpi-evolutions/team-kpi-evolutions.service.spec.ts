import { Test } from '@nestjs/testing';
import { TeamKpiEvolutionsService } from './team-kpi-evolutions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { KpiStatus } from '../entities/kpi.enums';
import { Team } from '../../team/entities/team.entity';
import { TeamsService } from '../../team/teams.service';

describe('TeamKpiEvolutionsService', () => {
  let service: TeamKpiEvolutionsService;
  let repo: jest.Mocked<Repository<TeamKPIEvolution>>;
  let teamRepo: jest.Mocked<Repository<Team>>;
  let teamsService: jest.Mocked<TeamsService>;

  function createRepoMock(): jest.Mocked<Repository<any>> {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(), // ✅ FALTAVA ISSO
      create: jest.fn((e) => e),
      save: jest.fn((e) => Promise.resolve({ ...e, id: e.id ?? 'generated-id' })),
      merge: jest.fn((entity, dto) => ({ ...entity, ...dto })),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamKpiEvolutionsService,
        {
          provide: getRepositoryToken(TeamKPIEvolution),
          useValue: createRepoMock(),
        },
        {
          provide: getRepositoryToken(Team),
          useValue: createRepoMock(),
        },
        {
          provide: TeamsService,
          useValue: {
            findUpperTeamsRecursive: jest.fn().mockResolvedValue([]),
            findLowerTeamsRecursive: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get(TeamKpiEvolutionsService);
    repo = module.get(getRepositoryToken(TeamKPIEvolution));
    teamRepo = module.get(getRepositoryToken(Team));
    teamsService = module.get(TeamsService) as any;
  });

  // ===========================================================================
  // CREATE
  // ===========================================================================
  it('create deve criar registro com sucesso', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      teamId: 't1',
      teamKpiId: 'k1',
      submittedDate: '2023-01-01',
    };

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('create deve lançar erro se duplicado', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        teamId: 't1',
        teamKpiId: 'k1',
        submittedDate: '2023-01-01',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ===========================================================================
  // FIND ALL
  // ===========================================================================
  it('findAll deve retornar lista paginada', async () => {
    // team do usuário
    teamRepo.findOne.mockResolvedValue({ id: 't1', companyId: 'c1' } as any);
    // times filhos (nenhum)
    teamsService.findLowerTeamsRecursive.mockResolvedValue([]);
    // retorno do repo
    repo.findAndCount.mockResolvedValue([[{ id: 'ev1' } as any], 1]);

    const user = { companyId: 'c1', teamId: 't1' } as any;
    const query = { page: 1, limit: 10 } as any;

    const result = await service.findAll(user, query);

    expect(repo.findAndCount).toHaveBeenCalled();
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'ev1' }],
    });
  });

  // ===========================================================================
  // FIND ONE
  // ===========================================================================
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1' } as any);

    const result = await service.findOne('c1', 'ev1');

    expect(result).toEqual({ id: 'ev1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ===========================================================================
  // UPDATE
  // ===========================================================================
  it('update deve atualizar', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1', companyId: 'c1' } as any);

    const result = await service.update('c1', 'ev1', { teamId: 't2' } as any);

    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro se chaves duplicadas', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'ev1', companyId: 'c1', teamId: 't1' } as any)
      .mockResolvedValueOnce({ id: 'ev2' } as any);

    await expect(
      service.update('c1', 'ev1', { teamId: 't2' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ===========================================================================
  // APPROVE
  // ===========================================================================
  it('approve deve aprovar KPI', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      companyId: 'c1',
      status: KpiStatus.SUBMITTED,
    } as any);

    const result = await service.approve('c1', 'ev1', 'u99');

    expect(repo.save).toHaveBeenCalled();
    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(result.approvedBy).toBe('u99');
  });

  it('approve deve lançar erro se já rejeitado', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      companyId: 'c1',
      status: KpiStatus.REJECTED,
    } as any);

    await expect(service.approve('c1', 'ev1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  // ===========================================================================
  // REJECT
  // ===========================================================================
  it('reject deve rejeitar KPI', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      companyId: 'c1',
      status: KpiStatus.SUBMITTED,
    } as any);

    const result = await service.reject('c1', 'ev1', 'u1', 'motivo');

    expect(repo.save).toHaveBeenCalled();
    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(result.rejectionReason).toBe('motivo');
  });

  it('reject deve lançar erro se aprovado', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      companyId: 'c1',
      status: KpiStatus.APPROVED,
    } as any);

    await expect(service.reject('c1', 'ev1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  // ===========================================================================
  // REMOVE
  // ===========================================================================
  it('remove deve deletar', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1', companyId: 'c1' } as any);

    await service.remove('c1', 'ev1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
