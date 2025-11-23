import { Test } from '@nestjs/testing';
import { PersonsService } from './persons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('PersonsService', () => {
  let service: PersonsService;
  let repo: jest.Mocked<Repository<Person>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PersonsService,
        { provide: getRepositoryToken(Person), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(PersonsService);
    repo = module.get(getRepositoryToken(Person));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar person', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      name: 'John',
      cpf: '123',
      companyId: 'c1',
    };

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.cpf).toBe('123');
  });

  it('create deve falhar se CPF já existir na empresa', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({ cpf: '123', companyId: 'c1' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve lançar ForbiddenException se nível < 3', async () => {
    await expect(
      service.findAll({ level: 2 } as any, {} as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('findAll deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'p1' } as any], 1]);

    const result = await service.findAll(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(repo.findAndCount).toHaveBeenCalled();
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'p1' }],
    });
  });

  // FIND ONE
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'p1' } as any);

    const result = await service.findOne('c1', 'p1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'p1' });
  });

  it('findOne deve falhar se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', 'p404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // UPDATE
  it('update deve atualizar person', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'p1', cpf: '123', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 'p1', { cpf: '456' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.cpf).toBe('456');
  });

  it('update deve falhar se CPF duplicado', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'p1', cpf: '123', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 'p1', { cpf: '999' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve excluir person', async () => {
    repo.findOne.mockResolvedValue({ id: 'p1' } as any);

    await service.remove('c1', 'p1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
