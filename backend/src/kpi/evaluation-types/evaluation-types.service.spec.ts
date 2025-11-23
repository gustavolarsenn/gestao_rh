import { Test } from '@nestjs/testing';
import { EvaluationTypesService } from './evaluation-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { EvaluationType } from '../entities/evaluation-type.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('EvaluationTypesService', () => {
  let service: EvaluationTypesService;
  let repo: jest.Mocked<Repository<EvaluationType>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      find: jest.fn(),
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
        EvaluationTypesService,
        { provide: getRepositoryToken(EvaluationType), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(EvaluationTypesService);
    repo = module.get(getRepositoryToken(EvaluationType));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar tipo de avaliação', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      name: 'Percentual',
      code: 'HIGHER_BETTER_PCT',
    };

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Percentual');
  });

  it('create deve falhar se nome duplicado', async () => {
    repo.findOne.mockResolvedValue({ id: 'dup' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        name: 'Percentual',
        code: 'HIGHER_BETTER_PCT',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve retornar página paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 't1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: '1', limit: '10' },
    );

    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 't1' }],
    });
  });

  // DISTINCT
  it('findDistinct deve retornar lista', async () => {
    repo.find.mockResolvedValue([{ id: 't1' }] as any);

    const result = await service.findDistinctEvaluationTypes({ role: 'admin', companyId: 'c1' } as any);

    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: 't1' }]);
  });

  // FIND ONE
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 't1' } as any);

    const result = await service.findOne('c1', 't1');

    expect(result).toEqual({ id: 't1' });
  });

  it('findOne deve falhar se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // UPDATE
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 't1', name: 'Old', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce(null); // nome não duplicado

    const result = await service.update('c1', 't1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  it('update deve falhar caso nome exista', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 't1', name: 'Old', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 't2' } as any);

    await expect(
      service.update('c1', 't1', { name: 'Duplicado' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve deletar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 't1' } as any);

    await service.remove('c1', 't1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
