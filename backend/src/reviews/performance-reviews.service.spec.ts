import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PerformanceReviewsService } from './performance-reviews.service';
import { PerformanceReview } from './entities/performance-review.entity';

describe('PerformanceReviewsService', () => {
  let service: PerformanceReviewsService;
  let repo: jest.Mocked<Repository<PerformanceReview>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const entity: PerformanceReview = Object.assign(new PerformanceReview(), {
    id,
    companyId,
    employeeId: 'emp-1',
    leaderId: 'emp-2',
    observation: 'Ótimo desempenho no trimestre.',
    date: '2025-09-01',
  });

  const repoMock: Partial<jest.Mocked<Repository<PerformanceReview>>> = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceReviewsService,
        { provide: getRepositoryToken(PerformanceReview), useValue: repoMock },
      ],
    }).compile();

    service = module.get(PerformanceReviewsService);
    repo = module.get(getRepositoryToken(PerformanceReview)) as jest.Mocked<Repository<PerformanceReview>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({
      companyId,
      employeeId: 'emp-1',
      leaderId: 'emp-2',
      observation: 'Ótimo desempenho no trimestre.',
      date: '2025-09-01',
    });
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(res).toEqual(entity);
  });

  it('findAll -> by company only', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll(companyId, {});
    expect(repo.find).toHaveBeenCalledWith({
      where: { companyId },
      order: { date: 'DESC' },
    });
    expect(res).toEqual([entity]);
  });

  it('findAll -> with filters', async () => {
    repo.find.mockResolvedValue([entity] as any);
    await service.findAll(companyId, {
      employeeId: 'emp-1',
      leaderId: 'emp-2',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
    });

    // valida forma geral da chamada (Between etc.)
    const call = (repo.find as jest.Mock).mock.calls[0][0];
    expect(call.where.companyId).toBe(companyId);
    expect(call.where.employeeId).toBe('emp-1');
    expect(call.where.leaderId).toBe('emp-2');
    // Between/MoreThanOrEqual/LessThanOrEqual são funções; checamos só que existe algum operador na chave date
    expect(call.where.date).toBeDefined();
  });

  it('findAll -> only startDate', async () => {
    repo.find.mockResolvedValue([entity] as any);
    await service.findAll(companyId, { startDate: '2025-09-01' });
    const call = (repo.find as jest.Mock).mock.calls.pop()![0];
    expect(call.where.date.type).toBe(MoreThanOrEqual('2025-09-01').type);
  });

  it('findAll -> only endDate', async () => {
    repo.find.mockResolvedValue([entity] as any);
    await service.findAll(companyId, { endDate: '2025-09-30' });
    const call = (repo.find as jest.Mock).mock.calls.pop()![0];
    expect(call.where.date.type).toBe(LessThanOrEqual('2025-09-30').type);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(companyId, id);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { companyId, id } });
    expect(res).toEqual(entity);
  });

  it('update -> merges and saves', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, observation: 'Excelente entrega.' } as any);
    repo.save.mockResolvedValue({ ...entity, observation: 'Excelente entrega.' } as any);

    const res = await service.update(companyId, id, { companyId, observation: 'Excelente entrega.' } as any);
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(res.observation).toBe('Excelente entrega.');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});