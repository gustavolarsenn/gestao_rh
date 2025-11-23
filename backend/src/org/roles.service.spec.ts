import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repo: jest.Mocked<Repository<Role>>;

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
        RolesService,
        { provide: getRepositoryToken(Role), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(RolesService);
    repo = module.get(getRepositoryToken(Role));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar um role', async () => {
    const dto: any = {
      name: 'Operador',
      departmentId: 'd1',
      roleTypeId: 'rt1',
      companyId: 'c1',
    };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Operador');
  });

  // FIND ALL
  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'r1', name: 'Operador' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: '1', limit: '10' }
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'r1' }],
    });
  });

  // DISTINCT
  it('findDistinctRoles deve retornar lista simples', async () => {
    repo.find.mockResolvedValue([{ id: 'r1' } as any]);

    const result = await service.findDistinctRoles({ role: 'admin', companyId: 'c1' });

    expect(result).toEqual([{ id: 'r1' }]);
  });

  // FIND ONE
  it('findOne deve retornar role', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1' } as any);

    const result = await service.findOne('c1', 'r1');

    expect(result).toEqual({ id: 'r1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar role', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1', companyId: 'c1', name: 'Old' } as any);

    const result = await service.update('c1', 'r1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  // REMOVE
  it('remove deve excluir role', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1', companyId: 'c1' } as any);

    await service.remove('c1', 'r1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
