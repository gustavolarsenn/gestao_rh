import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeKpisService } from '../employee-kpis.service';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import {  KpiStatus } from '../entities/kpi.enums';

describe('EmployeeKpisService', () => {
  let service: EmployeeKpisService;
  let repo: jest.Mocked<Repository<EmployeeKPI>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const entity: EmployeeKPI = Object.assign(new EmployeeKPI(), {
    id,
    companyId,
    employeeId: 'emp-1',
    kpiId: 'kpi-1',
    evaluationTypeId: 'et-1',
    periodStart: '2025-09-01',
    periodEnd: '2025-09-30',
    goal: '20',
    achievedValue: '22',
    status: KpiStatus.SUBMITTED,
    submittedBy: 'user-1',
    submittedDate: new Date(),
  });

  const repoMock: Partial<jest.Mocked<Repository<EmployeeKPI>>> = {
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
        EmployeeKpisService,
        { provide: getRepositoryToken(EmployeeKPI), useValue: repoMock },
      ],
    }).compile();

    service = module.get(EmployeeKpisService);
    repo = module.get(getRepositoryToken(EmployeeKPI)) as jest.Mocked<Repository<EmployeeKPI>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const result = await service.create({
      companyId,
      employeeId: 'emp-1',
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
    const result = await service.findAll(companyId, { employeeId: 'emp-1' } as any);
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
    repo.merge.mockReturnValue({ ...entity, achievedValue: '25' } as any);
    repo.save.mockResolvedValue({ ...entity, achievedValue: '25' } as any);
    const result = await service.update(companyId, id, { companyId, achievedValue: '25' } as any);
    expect(result.achievedValue).toBe('25');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});