import { Test } from '@nestjs/testing';
import { EmployeeKpisService } from './employee-kpis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { KpiStatus } from '../entities/kpi.enums';

describe('EmployeeKpisService', () => {
  let service: EmployeeKpisService;
  let repo: jest.Mocked<Repository<EmployeeKPI>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((e1, e2) => ({ ...e1, ...e2 })),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeeKpisService,
        { provide: getRepositoryToken(EmployeeKPI), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(EmployeeKpisService);
    repo = module.get(getRepositoryToken(EmployeeKPI));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar um registro', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      employeeId: 'e1',
      teamId: 't1',
      kpiId: 'k1',
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

  it('create deve lançar erro se unique já existir', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        employeeId: 'e1',
        teamId: 't1',
        kpiId: 'k1',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'k1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'k1' }],
    });
  });

  // FIND ONE
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1' } as any);

    const result = await service.findOne('c1', 'k1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'k1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'k1', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 'k1', { goal: '20' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('goal', '20');
  });

  it('update deve lançar erro se unique duplicado', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'k1', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 'k1', { employeeId: 'e2' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // APPROVE
  it('approve deve aprovar kpi', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1', status: KpiStatus.SUBMITTED } as any);

    const result = await service.approve('c1', 'k1', 'u1');

    expect(result.status).toBe(KpiStatus.APPROVED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('approve deve falhar se já rejeitado', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1', status: KpiStatus.REJECTED } as any);

    await expect(
      service.approve('c1', 'k1', 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // REJECT
  it('reject deve rejeitar kpi', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1', status: KpiStatus.SUBMITTED } as any);

    const result = await service.reject('c1', 'k1', 'u1', 'bad');

    expect(result.status).toBe(KpiStatus.REJECTED);
    expect(result.rejectionReason).toBe('bad');
  });

  it('reject deve falhar se já aprovado', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1', status: KpiStatus.APPROVED } as any);

    await expect(
      service.reject('c1', 'k1', 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1' } as any);

    await service.remove('c1', 'k1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
