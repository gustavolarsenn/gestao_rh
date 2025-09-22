import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repo: jest.Mocked<Repository<Employee>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '22222222-2222-2222-2222-222222222222';

  const entity: Employee = Object.assign(new Employee(), {
    id,
    companyId,
    name: 'John Doe',
    isActive: true,
  });

  const repoMock: Partial<jest.Mocked<Repository<Employee>>> = {
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
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: repoMock },
      ],
    }).compile();

    service = module.get(EmployeesService);
    repo = module.get(getRepositoryToken(Employee)) as jest.Mocked<Repository<Employee>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create({ companyId, name: 'John Doe' } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll -> list by company', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const result = await service.findAll(companyId);
    expect(repo.find).toHaveBeenCalledWith({ where: { companyId } });
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
    repo.merge.mockReturnValue({ ...entity, name: 'Updated' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Updated' } as any);

    const result = await service.update(companyId, id, { companyId, name: 'Updated' } as any);
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.name).toBe('Updated');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith(entity);
  });
});