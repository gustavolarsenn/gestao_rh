import { Test } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TeamsService', () => {
  let service: TeamsService;
  let repo: jest.Mocked<Repository<Team>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      create: jest.fn(e => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn(e => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(TeamsService);
    repo = module.get(getRepositoryToken(Team));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar team', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      name: 'Team A',
    };

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Team A');
  });

  it('create deve lançar erro se nome já existir', async () => {
    repo.findOne.mockResolvedValue({ id: 't1' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        name: 'Team A',
        description: 'Desc',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL (admin user)
  it('findAll deve aplicar filtros com usuário admin', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 't1' } as any], 1]);

    const user = { role: 'admin', companyId: 'c1' } as any;

    const result = await service.findAll(user, { page: '1', limit: '10' });

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('t1');
  });

  // FIND ALL (gestor)
  it('findAll deve filtrar por gestor', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'tX' } as any], 1]);

    const user = { role: 'gestor', teamId: 't99', companyId: 'c1' } as any;

    const result = await service.findAll(user, {});

    expect(repo.findAndCount).toHaveBeenCalledWith({
      where: { parentTeamId: 't99', companyId: 'c1' },
      skip: 0,
      take: 10,
    });

    expect(result.data[0]).toEqual({ id: 'tX' });
  });

  // FIND ONE
  it('findOne deve retornar team', async () => {
    repo.findOne.mockResolvedValue({ id: 't1' } as any);

    const result = await service.findOne('c1', 't1');

    expect(result).toEqual({ id: 't1' });
  });

  it('findOne deve lançar erro se não encontrar', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar team', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 't1', name: 'Old', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 't1', { name: 'New' });

    expect(repo.merge).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  it('update deve lançar erro se name já existir', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 't1', name: 'Old', companyId: 'c1' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 't1', { name: 'Duplicado' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve excluir team', async () => {
    repo.findOne.mockResolvedValue({ id: 't1' } as any);

    await service.remove('c1', 't1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
