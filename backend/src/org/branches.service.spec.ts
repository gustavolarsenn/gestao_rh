import { Test } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { NotFoundException } from '@nestjs/common';

describe('BranchesService', () => {
  let service: BranchesService;
  let repo: jest.Mocked<Repository<Branch>>;

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
        BranchesService,
        { provide: getRepositoryToken(Branch), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(BranchesService);
    repo = module.get(getRepositoryToken(Branch));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar branch', async () => {
    const dto: any = {
      name: 'Unidade 1',
      companyId: 'c1',
    };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Unidade 1');
  });

  // FIND ALL
  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'b1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'b1' }],
    });
  });

  // DISTINCT
  it('findDistinctBranches deve retornar lista', async () => {
    repo.find.mockResolvedValue([{ id: 'b1' }] as any);

    const result = await service.findDistinctBranches({ role: 'admin', companyId: 'c1' } as any);

    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'b1' }]);
  });

  // FIND ONE
  it('findOne deve retornar branch', async () => {
    repo.findOne.mockResolvedValue({ id: 'b1' } as any);

    const result = await service.findOne('c1', 'b1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'b1' });
  });

  it('findOne deve lançar erro se não encontrar', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar branch', async () => {
    repo.findOne.mockResolvedValue({ id: 'b1', companyId: 'c1' } as any);

    const result = await service.update('c1', 'b1', { name: 'Updated' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Updated');
  });

  // REMOVE
  it('remove deve excluir branch', async () => {
    repo.findOne.mockResolvedValue({ id: 'b1' } as any);

    await service.remove('c1', 'b1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
