import { Test } from '@nestjs/testing';
import { EmployeeKpiEvolutionsService } from './employee-kpi-evolutions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeKPIEvolution } from '../entities/employee-kpi-evolution.entity';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { TeamKPI } from '../entities/team-kpi.entity';
import { Team } from '../../team/entities/team.entity';
import { TeamsService } from '../../team/teams.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { KpiStatus } from '../entities/kpi.enums';

describe('EmployeeKpiEvolutionsService', () => {
  let service: EmployeeKpiEvolutionsService;
  let repo: jest.Mocked<Repository<EmployeeKPIEvolution>>;
  let employeeKpiRepo: jest.Mocked<Repository<EmployeeKPI>>;
  let teamKpiRepo: jest.Mocked<Repository<TeamKPI>>;
  let teamRepo: jest.Mocked<Repository<Team>>;
  let teamsService: jest.Mocked<TeamsService>;

  const mockRepo = (): any => ({
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn((e) => e),
    save: jest.fn(async (e) => ({ id: 'generated-id', ...e })),
    merge: jest.fn((entity, dto) => ({ ...entity, ...dto })),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeeKpiEvolutionsService,
        { provide: getRepositoryToken(EmployeeKPIEvolution), useValue: mockRepo() },
        { provide: getRepositoryToken(EmployeeKPI), useValue: mockRepo() },
        { provide: getRepositoryToken(TeamKPI), useValue: mockRepo() },
        { provide: getRepositoryToken(Team), useValue: mockRepo() },
        {
          provide: TeamsService,
          useValue: {
            findUpperTeamsRecursive: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get(EmployeeKpiEvolutionsService);
    repo = module.get(getRepositoryToken(EmployeeKPIEvolution));
    employeeKpiRepo = module.get(getRepositoryToken(EmployeeKPI));
    teamKpiRepo = module.get(getRepositoryToken(TeamKPI));
    teamRepo = module.get(getRepositoryToken(Team));
    teamsService = module.get(TeamsService) as any;
  });

  // ======================================================
  // CREATE
  // ======================================================
  it('deve criar employee KPI evolution com sucesso', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto = { employeeKpiId: 'k1' } as any;
    const req = { user: { companyId: 'c1', employeeId: 'e1', teamId: 't1', id: 'u1' } };

    const result = await service.create(dto, req);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('deve lançar erro se evolução binária já existir', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({ employeeKpiId: 'k1' } as any, {
        user: { companyId: 'c1', employeeId: 'e1', teamId: 't1', id: 'u1' },
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ======================================================
  // FIND ALL
  // ======================================================
  it('findAll deve retornar dados paginados', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'ev1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any
    );

    expect(result).toMatchObject({ page: 1, limit: 10, total: 1 });
  });

  // ======================================================
  // FIND ONE
  // ======================================================
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1' } as any);

    const result = await service.findOne('c1', 'ev1');

    expect(result).toEqual({ id: 'ev1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ======================================================
  // UPDATE
  // ======================================================
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1', employeeKpiId: 'k1' } as any);
    repo.save.mockResolvedValue({ id: 'ev1', achievedValueEvolution: '10' } as any);

    const result = await service.update('c1', 'ev1', { achievedValueEvolution: '10' } as any);

    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro em conflito de duplicidade', async () => {
    repo.findOne
      .mockResolvedValueOnce({ id: 'ev1', employeeKpiId: 'k1', submittedDate: '2023-01-01' } as any)
      .mockResolvedValueOnce({ id: 'ev2' } as any);

    await expect(
      service.update('c1', 'ev1', { employeeKpiId: 'kX', submittedDate: '2023-01-01' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ======================================================
  // APPROVE
  // ======================================================
  it('approve deve aprovar evolução', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      status: KpiStatus.DRAFT,
      employeeId: 'e1',
      employeeKpiId: 'k1',
      employeeKpi: { kpi: { evaluationType: { code: 'BINARY' } } },
      employee: { teamId: 't1' },
    } as any);

    employeeKpiRepo.findOne.mockResolvedValue({ id: 'k1' } as any);
    teamKpiRepo.findOne.mockResolvedValue(null);

    const req = { user: { id: 'u1' } };

    const result = await service.approve('c1', 'ev1', req);

    expect(result.status).toBe(KpiStatus.APPROVED);
  });

  // ======================================================
  // REJECT
  // ======================================================
  it('reject deve rejeitar evolução', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      status: KpiStatus.DRAFT,
      employeeKpiId: 'k1',
      employeeId: 'e1',
      employeeKpi: { kpi: { evaluationType: { code: 'BINARY' } } },
    } as any);

    employeeKpiRepo.findOne.mockResolvedValue({ id: 'k1' } as any);

    const req = { user: { id: 'u1' } };

    const result = await service.reject('c1', 'ev1', req, 'bad');

    expect(result.status).toBe(KpiStatus.REJECTED);
  });

  // ======================================================
  // REMOVE
  // ======================================================
  it('remove deve deletar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'ev1' } as any);

    await service.remove('c1', 'ev1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
