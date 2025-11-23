import { Test } from '@nestjs/testing';
import { RoleTypesService } from './role-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleType } from './entities/role-type.entity';
import { NotFoundException } from '@nestjs/common';

describe('RoleTypesService', () => {
  let service: RoleTypesService;
  let repo: jest.Mocked<Repository<RoleType>>;

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
        RoleTypesService,
        { provide: getRepositoryToken(RoleType), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(RoleTypesService);
    repo = module.get(getRepositoryToken(RoleType));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar um roleType', async () => {
    const dto: any = { name: 'Supervisor', companyId: 'c1', departmentId: 'd1' };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Supervisor');
  });

  // FIND ALL
  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'rt1', name: 'Supervisor' }], 1] as any);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: '1', limit: '10' }
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'rt1' }],
    });
  });

  // DISTINCT
  it('findDistinctRoleTypes deve retornar lista simples', async () => {
    repo.find.mockResolvedValue([{ id: 'rt1' }] as any);

    const result = await service.findDistinctRoleTypes({ role: 'admin', companyId: 'c1' });

    expect(result).toEqual([{ id: 'rt1' }]);
  });

  // FIND ONE
  it('findOne deve retornar roleType', async () => {
    repo.findOne.mockResolvedValue({ id: 'rt1' } as any);

    const result = await service.findOne('c1', 'rt1');

    expect(result).toEqual({ id: 'rt1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'rt1', companyId: 'c1', name: 'Old' } as any);

    const result = await service.update('c1', 'rt1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'rt1', companyId: 'c1' } as any);

    await service.remove('c1', 'rt1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
