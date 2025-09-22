import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeHistoriesService } from './employee-histories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeHistory } from './entities/employee-history.entity';

describe('EmployeeHistoriesService', () => {
  let service: EmployeeHistoriesService;
  let repo: jest.Mocked<Repository<EmployeeHistory>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '33333333-3333-3333-3333-333333333333';

  const entity: EmployeeHistory = Object.assign(new EmployeeHistory(), {
    id,
    companyId,
    employeeId: 'emp-1',
    roleId: 'role-1',
    wage: '1000.00',
    startDate: '2025-01-01',
  });

  const repoMock: Partial<jest.Mocked<Repository<EmployeeHistory>>> = {
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
        EmployeeHistoriesService,
        { provide: getRepositoryToken(EmployeeHistory), useValue: repoMock },
      ],
    }).compile();

    service = module.get(EmployeeHistoriesService);
    repo = module.get(getRepositoryToken(EmployeeHistory)) as jest.Mocked<Repository<EmployeeHistory>>;
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
      roleId: 'role-1',
      wage: '1000.00',
      startDate: '2025-01-01',
    } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll -> by company', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const result = await service.findAll(companyId);
    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([entity]);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const result = await service.findOne(companyId, id);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { companyId, id } });
    expect(result).toEqual(entity);
  });

  it('update -> merges', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, wage: '1200.00' } as any);
    repo.save.mockResolvedValue({ ...entity, wage: '1200.00' } as any);
    const result = await service.update(companyId, id, { companyId, wage: '1200.00' } as any);
    expect(result.wage).toBe('1200.00');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});