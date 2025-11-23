import { Test } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repo: jest.Mocked<Repository<Department>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn((e) => Promise.resolve({ ...e, id: e.id ?? 'generated-id' })),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getRepositoryToken(Department), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(DepartmentsService);
    repo = module.get(getRepositoryToken(Department));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar um department', async () => {
    const dto: any = { name: 'Operations', companyId: 'c1' };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Operations');
  });

  // FIND ALL
  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'd1', name: 'Operations' }], 1] as any);

    const result = await service.findAll(
    { role: 'admin', companyId: 'c1' } as any,
    { page: '1', limit: '10' },
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'd1' }],
    });
  });

  // DISTINCT
  it('findDistinctDepartments deve retornar lista simples', async () => {
    repo.find.mockResolvedValue([{ id: 'd1' }] as any);

    const result = await service.findDistinctDepartments({ role: 'admin', companyId: 'c1' });

    expect(result).toEqual([{ id: 'd1' }]);
  });

  // FIND ONE
  it('findOne deve retornar department', async () => {
    repo.findOne.mockResolvedValue({ id: 'd1' } as any);

    const result = await service.findOne('c1', 'd1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'd1' });
  });

  it('findOne deve lançar erro quando não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve alterar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'd1', companyId: 'c1', name: 'Old' } as any);

    const result = await service.update('c1', 'd1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'd1', companyId: 'c1' } as any);

    await service.remove('c1', 'd1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
