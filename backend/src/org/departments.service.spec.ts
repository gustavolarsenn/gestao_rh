// src/org/departments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repo: jest.Mocked<Repository<Department>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const entity: Department = Object.assign(new Department(), { id, companyId, name: 'Engenharia' });

  const repoMock: Partial<jest.Mocked<Repository<Department>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getRepositoryToken(Department), useValue: repoMock },
      ],
    }).compile();

    service = module.get(DepartmentsService);
    repo = module.get(getRepositoryToken(Department)) as jest.Mocked<Repository<Department>>;
  });

  it('create', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'Engenharia' } as any);
    expect(res).toEqual(entity);
  });

  it('findAll', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll(companyId);
    expect(res).toEqual([entity]);
  });

  it('findOne', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(companyId, id);
    expect(res).toEqual(entity);
  });

  it('update', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, name: 'Produto' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Produto' } as any);
    const res = await service.update(companyId, id, { companyId, name: 'Produto' } as any);
    expect(res.name).toBe('Produto');
  });

  it('remove', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});