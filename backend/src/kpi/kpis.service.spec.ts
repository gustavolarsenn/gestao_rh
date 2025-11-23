import { Test } from '@nestjs/testing';
import { KpisService } from './kpis.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KPI } from './entities/kpi.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('KpisService', () => {
  let service: KpisService;
  let repo: jest.Mocked<Repository<KPI>>;

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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KpisService,
        { provide: getRepositoryToken(KPI), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(KpisService);
    repo = module.get(getRepositoryToken(KPI));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar KPI', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      name: 'KPI Test',
      evaluationTypeId: 'et1',
    };

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('KPI Test');
  });

  it('create deve lançar conflito se já existe', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({ companyId: 'c1', name: 'KPI Test' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve retornar paginado', async () => {
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

  // DISTINCT
  it('findDistinctKpis deve retornar lista', async () => {
    repo.find.mockResolvedValue([{ id: 'k1' }] as any);

    const result = await service.findDistinctKpis({ role: 'admin', companyId: 'c1' } as any);

    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'k1' }]);
  });

  // FIND ONE
  it('findOne deve retornar KPI', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1' } as any);

    const result = await service.findOne('c1', 'k1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'k1' });
  });

  it('findOne deve lançar exceção se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', 'k404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar KPI', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'k1', name: 'Old', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 'k1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  it('update deve lançar conflito se nome já existe', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'k1', name: 'Old' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 'k1', { name: 'Duplicate' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve excluir KPI', async () => {
    repo.findOne.mockResolvedValue({ id: 'k1' } as any);

    await service.remove('c1', 'k1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
