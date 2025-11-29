import { Test } from '@nestjs/testing';
import { PerformanceReviewsService } from './performance-reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { NotFoundException } from '@nestjs/common';
import { TeamMember } from '../team/entities/team-member.entity';

describe('PerformanceReviewsService', () => {
  let service: PerformanceReviewsService;
  let repo: jest.Mocked<Repository<PerformanceReview>>;

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
        PerformanceReviewsService,
        {
          provide: getRepositoryToken(PerformanceReview),
          useValue: mockRepo(),
        },
        {
          // mock para o TeamMember, necessário por causa da injeção no service
          provide: getRepositoryToken(TeamMember),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get(PerformanceReviewsService);
    repo = module.get(getRepositoryToken(PerformanceReview));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // CREATE (para colaborador)
  it('createToEmployee deve criar review com leaderId vindo do user', async () => {
    const user = { employeeId: 'leader1' };
    const dto = { employeeId: 'emp1', date: '2024-01-02' };

    const result = await service.createToEmployee(user as any, dto as any);

    expect(repo.create).toHaveBeenCalledWith({
      leaderId: user.employeeId,
      employeeToLeader: false,
      ...dto,
    });
    expect(repo.save).toHaveBeenCalled();
    expect(result.employeeId).toBe('emp1');
  });

  // FIND ALL (pagination + sem filtros) - usando findAllToEmployee
  it('findAllToEmployee deve retornar lista paginada', async () => {
    repo.findAndCount.mockResolvedValue([[{ id: 'rev1' } as any], 1]);

    const result = await service.findAllToEmployee(
      { role: 'admin', companyId: 'c1' } as any,
      { page: 1, limit: 10 } as any,
    );

    expect(repo.findAndCount).toHaveBeenCalled();
    expect(result).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'rev1' }],
    });
  });

  // FIND ALL date filter: BETWEEN
  it('findAllToEmployee deve aplicar filtro BETWEEN quando startDate e endDate existem', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);

    await service.findAllToEmployee(
      { role: 'admin', companyId: 'c1' } as any,
      {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      } as any,
    );

    const where = repo.findAndCount.mock.calls[0][0]!.where as any;

    expect(where.date).toEqual(Between('2024-01-01', '2024-01-31'));
  });

  // START ONLY
  it('findAllToEmployee deve aplicar filtro >= quando só startDate existe', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);

    await service.findAllToEmployee(
      { role: 'admin', companyId: 'c1' } as any,
      { startDate: '2024-01-01' } as any,
    );

    const where = repo.findAndCount.mock.calls[0][0]!.where as any;

    expect(where.date).toEqual(MoreThanOrEqual('2024-01-01'));
  });

  // END ONLY
  it('findAllToEmployee deve aplicar filtro <= quando só endDate existe', async () => {
    repo.findAndCount.mockResolvedValue([[], 0]);

    await service.findAllToEmployee(
      { role: 'admin', companyId: 'c1' } as any,
      { endDate: '2024-01-31' } as any,
    );

    const where = repo.findAndCount.mock.calls[0][0]!.where as any;

    expect(where.date).toEqual(LessThanOrEqual('2024-01-31'));
  });

  // FIND ONE
  it('findOne deve retornar registro', async () => {
    repo.findOne.mockResolvedValue({ id: 'rev1' } as any);

    const result = await service.findOne('c1', 'rev1');

    expect(repo.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'rev1' });
  });

  it('findOne deve falhar se não encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', 'r404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  // UPDATE
  it('update deve atualizar review', async () => {
    repo.findOne.mockResolvedValue({ id: 'rev1', observation: null } as any);

    const result = await service.update('c1', 'rev1', {
      observation: 'updated',
    } as any);

    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.observation).toBe('updated');
  });

  // REMOVE
  it('remove deve excluir review', async () => {
    repo.findOne.mockResolvedValue({ id: 'rev1' } as any);

    await service.remove('c1', 'rev1');

    expect(repo.remove).toHaveBeenCalled();
  });
});
