import { Test } from '@nestjs/testing';
import { TeamMembersService } from './team-members.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TeamMembersService', () => {
  let service: TeamMembersService;
  let repo: jest.Mocked<Repository<TeamMember>>;

  function mockRepo() {
    return {
      findOne: jest.fn(),
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
        TeamMembersService,
        { provide: getRepositoryToken(TeamMember), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(TeamMembersService);
    repo = module.get(getRepositoryToken(TeamMember));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE
  it('create deve criar membro', async () => {
    repo.findOne.mockResolvedValue(null);

    const dto: any = {
      companyId: 'c1',
      teamId: 't1',
      employeeId: 'e1',
      startDate: '2024-01-01',
      isLeader: false,
    };

    await service.create(dto);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('create deve lançar erro se já existir membro ativo', async () => {
    repo.findOne.mockResolvedValue({ id: 'exists' } as any);

    await expect(
      service.create({
        companyId: 'c1',
        teamId: 't1',
        employeeId: 'e1',
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // FIND ALL
  it('findAll deve aplicar filtros corretamente', async () => {
    repo.find.mockResolvedValue([{ id: 'm1' }] as any);

    const user = { role: 'admin', companyId: 'c1' } as any;

    const result = await service.findAll(user, {
      teamId: 't1',
      employeeId: 'e1',
      parentTeamId: 'p1',
      active: true,
    });

    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'm1' }]);
  });

  // FIND ONE
  it('findOne deve retornar membro', async () => {
    repo.findOne.mockResolvedValue({ id: 'm1' } as any);

    const result = await service.findOne('c1', 'm1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'm1' });
  });

  it('findOne deve lançar erro se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', '404')).rejects.toBeInstanceOf(NotFoundException);
  });

  // UPDATE
  it('update deve atualizar membro', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'm1', companyId: 'c1', teamId: 't1', employeeId: 'e1' } as any);
    repo.findOne.mockResolvedValueOnce(null);

    const result = await service.update('c1', 'm1', { isLeader: true } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.isLeader).toBe(true);
  });

  it('update deve lançar erro se já existir conflito', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'm1', companyId: 'c1', teamId: 't1', employeeId: 'e1' } as any);
    repo.findOne.mockResolvedValueOnce({ id: 'other' } as any);

    await expect(
      service.update('c1', 'm1', { teamId: 'tX' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  // REMOVE
  it('remove deve excluir registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'm1' } as any);

    await service.remove('c1', 'm1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
