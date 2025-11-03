import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamKpisService } from './team-kpis.service';
import { TeamKPI } from '../entities/team-kpi.entity';
import { KpiStatus } from '../entities/kpi.enums';

describe('TeamKpisService', () => {
  let service: TeamKpisService;
  let repo: jest.Mocked<Repository<TeamKPI>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  const entity: TeamKPI = Object.assign(new TeamKPI(), {
    id,
    companyId,
    teamId: 'team-1',
    kpiId: 'kpi-1',
    evaluationTypeId: 'et-1',
    periodStart: '2025-09-01',
    periodEnd: '2025-09-30',
    goal: '100',
    achievedValue: '110',
    status: KpiStatus.APPROVED,
    submittedBy: 'user-1',
    submittedDate: new Date(),
  });

  const repoMock: Partial<jest.Mocked<Repository<TeamKPI>>> = {
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
        TeamKpisService,
        { provide: getRepositoryToken(TeamKPI), useValue: repoMock },
      ],
    }).compile();

    service = module.get(TeamKpisService);
    repo = module.get(getRepositoryToken(TeamKPI)) as jest.Mocked<Repository<TeamKPI>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const result = await service.create({
      companyId,
      teamId: 'team-1',
      kpiId: 'kpi-1',
      evaluationTypeId: 'et-1',
      periodStart: '2025-09-01',
      periodEnd: '2025-09-30',
      submittedBy: 'user-1',
    } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll -> list', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const result = await service.findAll(companyId, { teamId: 'team-1' } as any);
    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([entity]);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const result = await service.findOne(companyId, id);
    expect(result).toEqual(entity);
  });

  it('update -> merges', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, achievedValue: '120' } as any);
    repo.save.mockResolvedValue({ ...entity, achievedValue: '120' } as any);
    const result = await service.update(companyId, id, { companyId, achievedValue: '120' } as any);
    expect(result.achievedValue).toBe('120');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});