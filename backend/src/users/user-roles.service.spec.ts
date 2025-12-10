import { Test } from '@nestjs/testing';
import { UserRolesService } from './user-roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserRolesService', () => {
  let service: UserRolesService;
  let repo: jest.Mocked<Repository<UserRole>>;

  function mockRepo() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRolesService,
        { provide: getRepositoryToken(UserRole), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(UserRolesService);
    repo = module.get(getRepositoryToken(UserRole));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar user role', async () => {
    const dto = { name: 'Admin', description: 'x', level: 1 } as any;

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Admin');
  });

  // FIND ALL
  it('findAll deve retornar todos', async () => {
    repo.find.mockResolvedValue([{ id: 'r1' }] as any);

    // ✅ agora passando um "user" fake com level
    const result = await service.findAll({ level: 3 } as any);

    expect(result).toEqual([{ id: 'r1' }]);
  });

  // FIND ONE
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1' } as any);

    const result = await service.findOne('r1');

    expect(result).toEqual({ id: 'r1' });
  });

  it('findOne deve lançar NotFound', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar registro', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'r1', name: 'Old' } as any);

    const result = await service.update('r1', { name: 'New' } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('New');
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'r1' } as any);

    await service.remove('r1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
