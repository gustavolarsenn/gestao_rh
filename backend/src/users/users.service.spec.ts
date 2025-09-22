import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock determinístico para o hash
jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hash'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  const entity: User = Object.assign(new User(), {
    id: userId,
    companyId,
    name: 'Alice',
    email: 'alice@acme.com',
    passwordHash: 'hash',
    isActive: true,
  });

  // Mock explícito das funções usadas do Repository<User>
  const repoMock: Partial<jest.Mocked<Repository<User>>> = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    // zera chamadas a cada teste
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repoMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // forçamos o tipo esperado (evita o erro do ObjectLiteral)
    repo = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> salva usuário com bcrypt.hash', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create({
      companyId,
      name: 'Alice',
      email: 'alice@acme.com',
      password: 'Secret123!',
      isActive: true,
    });

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll -> retorna lista por companyId', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const result = await service.findAll(companyId);
    expect(repo.find).toHaveBeenCalledWith({ where: { companyId } });
    expect(result).toEqual([entity]);
  });

  it('findOne -> retorna usuário', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const result = await service.findOne(companyId, userId);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { companyId, id: userId } });
    expect(result).toEqual(entity);
  });

  it('update -> faz merge e save', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, name: 'Alice Updated' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Alice Updated' } as any);

    const result = await service.update(companyId, userId, { name: 'Alice Updated', companyId });
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Alice Updated');
  });

  it('remove -> deleta usuário', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);

    await expect(service.remove(companyId, userId)).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });
});