import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Person } from '../person/entities/person.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed123'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let personRepo: jest.Mocked<Repository<Person>>;

  function mockRepo() {
    return {
      find: jest.fn(),
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
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(Person), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    personRepo = module.get(getRepositoryToken(Person));
  });

  function mockUser() {
    return {
      id: 'u1',
      companyId: 'c1',
      email: 'a@a.com',
      name: 'Test',
      passwordHash: 'old',
      personId: 'p1',
      userRoleId: 'r1',
    } as any as User;
  }

  // -----------------------------------------------------
  // CREATE
  // -----------------------------------------------------
  it('create deve criar usuário', async () => {
    userRepo.findOne.mockResolvedValueOnce(null); // email livre
    personRepo.findOne.mockResolvedValueOnce({ id: 'p1', email: 'a@a.com' } as any);

    userRepo.save.mockResolvedValueOnce(mockUser());

    const result = await service.create({
      companyId: 'c1',
      name: 'Test',
      personId: 'p1',
      email: 'a@a.com',
      userRoleId: 'r1',
      password: '123',
    } as any);

    expect(personRepo.findOne).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
    expect(result.id).toBe('u1');
  });

  it('create deve lançar erro se email duplicado', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser());

    await expect(
      service.create({
        companyId: 'c1',
        personId: 'p1',
        email: 'a@a.com',
        password: '123',
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('create deve lançar erro se pessoa não existir', async () => {
    userRepo.findOne.mockResolvedValueOnce(null);
    personRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create({
        companyId: 'c1',
        personId: 'p1',
        email: 'a@a.com',
        password: '123',
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  // -----------------------------------------------------
  // FIND ALL
  // -----------------------------------------------------
  it('findAll deve respeitar permissão', async () => {
    await expect(service.findAll({ level: 1, role: 'admin', companyId: 'c1' } as any, {page: 1, limit: 10} as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('findAll deve retornar lista paginada', async () => {
    const user = { role: 'admin', companyId: 'c1' };
    userRepo.findAndCount.mockResolvedValueOnce([[mockUser()], 1]);

    const result = await service.findAll(user, { page: 1, limit: 10 } as any);

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe('u1');
  });

  // -----------------------------------------------------
  // FIND ONE
  // -----------------------------------------------------
  it('findOne deve retornar registro', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser());

    const result = await service.findOne('c1', 'u1');

    expect(result.id).toBe('u1');
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    userRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne('c1', 'x')).rejects.toThrow(
      NotFoundException,
    );
  });

  // -----------------------------------------------------
  // UPDATE
  // -----------------------------------------------------
  it('update deve atualizar usuário', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser()); // findOne base
    userRepo.findOne.mockResolvedValueOnce(null); // email livre

    userRepo.save.mockResolvedValueOnce({ ...mockUser(), name: 'Updated' } as any);

    const result = await service.update('c1', 'u1', {
      name: 'Updated',
    } as any);

    expect(userRepo.merge).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
    expect(result.name).toBe('Updated');
  });

  it('update deve alterar senha quando enviada', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser());
    userRepo.findOne.mockResolvedValueOnce(null);

    userRepo.save.mockResolvedValueOnce({ ...mockUser(), passwordHash: 'hashed123' } as any);

    const result = await service.update('c1', 'u1', { password: '321' } as any);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(result.passwordHash).toBe('hashed123');
  });

  it('update deve lançar erro se email duplicado', async () => {
    // registro atual tem email diferente
    userRepo.findOne
      .mockResolvedValueOnce({ ...mockUser(), email: 'old@email.com' } as any)
      .mockResolvedValueOnce({ id: 'u2', email: 'new@email.com' } as any);

    await expect(
      service.update('c1', 'u1', { email: 'new@email.com' } as any)
    ).rejects.toThrow(ConflictException);
  });

  // -----------------------------------------------------
  // REMOVE
  // -----------------------------------------------------
  it('remove deve excluir registro', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser());
    userRepo.remove.mockResolvedValueOnce(undefined as any);

    await service.remove('c1', 'u1');

    expect(userRepo.remove).toHaveBeenCalled();
  });
});
