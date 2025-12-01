import { Test } from '@nestjs/testing';
import { EmployeeKpiEvolutionsService } from './employee-kpi-evolutions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeKPIEvolution } from '../entities/employee-kpi-evolution.entity';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { TeamKPI } from '../entities/team-kpi.entity';
import { Team } from '../../team/entities/team.entity';
import { TeamsService } from '../../team/teams.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { KpiStatus } from '../entities/kpi.enums';
import { TeamKPIEvolution } from '../entities/team-kpi-evolution.entity';

describe('EmployeeKpiEvolutionsService', () => {
  let service: EmployeeKpiEvolutionsService;
  let repo: jest.Mocked<Repository<EmployeeKPIEvolution>>;
  let employeeKpiRepo: jest.Mocked<Repository<EmployeeKPI>>;
  let teamKpiRepo: jest.Mocked<Repository<TeamKPI>>;
  let teamRepo: jest.Mocked<Repository<Team>>;
  let teamsService: jest.Mocked<TeamsService>;
  let teamKpiEvolutionRepo: jest.Mocked<Repository<TeamKPIEvolution>>;

  const mockRepo = (): any => ({
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn((e) => e),
    save: jest.fn(async (e) => ({ id: 'generated-id', ...e })),
    merge: jest.fn((entity, dto) => ({ ...entity, ...dto })),
    remove: jest.fn(),
    find: jest.fn(),
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
          provide: getRepositoryToken(TeamKPIEvolution),
          useValue: mockRepo(),
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

    service = module.get(EmployeeKpiEvolutionsService);
    repo = module.get(getRepositoryToken(EmployeeKPIEvolution));
    employeeKpiRepo = module.get(getRepositoryToken(EmployeeKPI));
    teamKpiRepo = module.get(getRepositoryToken(TeamKPI));
    teamRepo = module.get(getRepositoryToken(Team));
    teamKpiEvolutionRepo = module.get(
      getRepositoryToken(TeamKPIEvolution),
    );
    teamsService = module.get(TeamsService) as any;
  });

  // ======================================================
  // CREATE
  // ======================================================
  it('deve criar employee KPI evolution com sucesso', async () => {
    // não existe evolução binária ainda
    repo.findOne.mockResolvedValue(null);

    // EmployeeKPI encontrado
    employeeKpiRepo.findOne.mockResolvedValue({
      id: 'k1',
      companyId: 'c1',
      employeeId: 'e1',
      teamId: 't1',
      kpi: { evaluationType: { code: 'BINARY' } },
    } as any);

    const dto = { employeeKpiId: 'k1' } as any;
    const req = {
      user: { companyId: 'c1', employeeId: 'e1', teamId: 't1', id: 'u1' },
    };

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

  it('deve lançar erro se EmployeeKPI não for encontrado ao criar', async () => {
    repo.findOne.mockResolvedValue(null);
    employeeKpiRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create({ employeeKpiId: 'k1' } as any, {
        user: { companyId: 'c1', employeeId: 'e1', teamId: 't1', id: 'u1' },
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ======================================================
  // FIND ALL
  // ======================================================
  it('findAll deve retornar dados paginados', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'ev1' } as any], 1]);
    teamRepo.findOne.mockResolvedValue({ id: 't1' } as any);
    (teamsService.findLowerTeamsRecursive as jest.Mock).mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
    ]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1', teamId: 't1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(repo.findAndCount).toHaveBeenCalled();
  });

  it('findAll deve aplicar filtro de status quando informado', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'ev2' } as any], 1]);
    teamRepo.findOne.mockResolvedValue({ id: 't1' } as any);
    (teamsService.findLowerTeamsRecursive as jest.Mock).mockResolvedValue([]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1', teamId: 't1' } as any,
      { page: 2, limit: 5, status: KpiStatus.APPROVED } as any,
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(repo.findAndCount).toHaveBeenCalled();
  });

  // ======================================================
  // FIND ALL EMPLOYEE
  // ======================================================
  it('findAllEmployee deve retornar dados paginados', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'ev3' } as any], 1]);

    const result = await service.findAllEmployee(
      { companyId: 'c1', employeeId: 'e1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result.total).toBe(1);
    expect(repo.findAndCount).toHaveBeenCalled();
  });

  it('findAllEmployee deve aplicar filtro de status', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'ev4' } as any], 1]);

    const result = await service.findAllEmployee(
      { companyId: 'c1', employeeId: 'e1' } as any,
      { page: 1, limit: 10, status: KpiStatus.REJECTED } as any,
    );

    expect(result.total).toBe(1);
    expect(repo.findAndCount).toHaveBeenCalled();
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

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // ======================================================
  // UPDATE
  // ======================================================
  it('update deve atualizar registro sem mudança de chaves únicas', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      employeeKpiId: 'k1',
      submittedDate: '2023-01-01',
    } as any);

    const result = await service.update(
      'c1',
      'ev1',
      { achievedValueEvolution: '10' } as any,
    );

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve atualizar quando chaves mudam mas não há duplicidade', async () => {
    // primeiro findOne -> row existente
    repo.findOne
      .mockResolvedValueOnce({
        id: 'ev1',
        employeeKpiId: 'k1',
        submittedDate: '2023-01-01',
      } as any)
      // segundo findOne (busca duplicidade) -> null
      .mockResolvedValueOnce(null as any);

    const result = await service.update(
      'c1',
      'ev1',
      { employeeKpiId: 'k2', submittedDate: '2023-01-02' } as any,
    );

    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('update deve lançar erro em conflito de duplicidade', async () => {
    repo.findOne
      .mockResolvedValueOnce({
        id: 'ev1',
        employeeKpiId: 'k1',
        submittedDate: '2023-01-01',
      } as any)
      .mockResolvedValueOnce({ id: 'ev2' } as any);

    await expect(
      service.update(
        'c1',
        'ev1',
        { employeeKpiId: 'kX', submittedDate: '2023-01-01' } as any,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // ======================================================
  // APPROVE
  // ======================================================
  it('approve deve aprovar evolução (BINARY) sem TeamKPI associado', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      status: KpiStatus.DRAFT,
      employeeId: 'e1',
      employeeKpiId: 'k1',
      companyId: 'c1',
      employeeKpi: { kpi: { evaluationType: { code: 'BINARY' }, id: 'k1' } },
      employee: { teamId: 't1' },
      achievedValueEvolution: '1',
      teamId: 't1',
    } as any);

    employeeKpiRepo.findOne.mockResolvedValue({
      id: 'k1',
      companyId: 'c1',
      employeeId: 'e1',
      teamId: 't1',
      achievedValue: '0',
    } as any);

    teamKpiRepo.findOne.mockResolvedValue(null);

    const req = { user: { id: 'u1' } };

    const result = await service.approve('c1', 'ev1', req);

    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('approve deve apenas retornar registro se já estiver APPROVED', async () => {
    const row = {
      id: 'ev1',
      status: KpiStatus.APPROVED,
    } as any;

    jest.spyOn(service as any, 'findOne').mockResolvedValue(row);

    const req = { user: { id: 'u1' } };

    const result = await service.approve('c1', 'ev1', req);

    expect(result).toBe(row);
  });

  it('approve deve lançar erro se status REJECTED', async () => {
    const row = {
      id: 'ev1',
      status: KpiStatus.REJECTED,
    } as any;

    jest.spyOn(service as any, 'findOne').mockResolvedValue(row);

    const req = { user: { id: 'u1' } };

    await expect(
      service.approve('c1', 'ev1', req),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ======================================================
  // REJECT
  // ======================================================
  it('reject deve rejeitar evolução (BINARY)', async () => {
    repo.findOne.mockResolvedValue({
      id: 'ev1',
      status: KpiStatus.DRAFT,
      employeeKpiId: 'k1',
      employeeId: 'e1',
      employeeKpi: { kpi: { evaluationType: { code: 'BINARY' } } },
      companyId: 'c1',
    } as any);

    employeeKpiRepo.findOne.mockResolvedValue({ id: 'k1' } as any);

    const req = { user: { id: 'u1' } };

    const result = await service.reject('c1', 'ev1', req, 'bad');

    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('reject deve retornar registro se já estiver REJECTED', async () => {
    const row = {
      id: 'ev1',
      status: KpiStatus.REJECTED,
    } as any;

    jest.spyOn(service as any, 'findOne').mockResolvedValue(row);

    const req = { user: { id: 'u1' } };

    const result = await service.reject('c1', 'ev1', req, 'x');

    expect(result).toBe(row);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('reject deve lançar erro se status APPROVED', async () => {
    const row = {
      id: 'ev1',
      status: KpiStatus.APPROVED,
    } as any;

    jest.spyOn(service as any, 'findOne').mockResolvedValue(row);

    const req = { user: { id: 'u1' } };

    await expect(
      service.reject('c1', 'ev1', req, 'x'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('reject não deve chamar employeeKpiRepo para KPI não binário', async () => {
    const row = {
      id: 'ev1',
      status: KpiStatus.DRAFT,
      employeeKpi: { kpi: { evaluationType: { code: 'LOWER_BETTER_PCT' } } },
      companyId: 'c1',
      employeeId: 'e1',
      employeeKpiId: 'k1',
    } as any;

    jest.spyOn(service as any, 'findOne').mockResolvedValue(row);

    const req = { user: { id: 'u1' } };

    await service.reject('c1', 'ev1', req, 'x');

    expect(employeeKpiRepo.findOne).not.toHaveBeenCalled();
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
