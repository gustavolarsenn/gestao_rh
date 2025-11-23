import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareerPathsService } from './career-paths.service';
import { CareerPath } from './entities/career-path.entity';
import { NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

describe('CareerPathsService', () => {
  let service: CareerPathsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerPathsService,
        { provide: getRepositoryToken(CareerPath), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(CareerPathsService);
    repo = module.get(getRepositoryToken(CareerPath));
  });

  it('create', async () => {
    const dto = {
      name: 'Teste',
      companyId: 'c1',
      departmentId: 'd1',
      currentRoleId: 'r1',
      nextRoleId: 'r2',
    };

    const entity = { id: 'p1', ...dto };

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll', async () => {
    const mock = [{ id: 'p1' }];
    repo.find.mockResolvedValue(mock);

    const result = await service.findAll('c1', { departmentId: 'd1', currentRoleId: 'r1' });

    expect(repo.find).toHaveBeenCalledWith({
      where: {
        companyId: 'c1',
        department: { id: 'd1' },
        currentRoleId: 'r1',
      },
      relations: ['department', 'currentRole', 'nextRole'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    expect(result).toEqual(mock);
  });

  it('findOne - success', async () => {
    const entity = { id: 'p1', companyId: 'c1' };
    repo.findOne.mockResolvedValue(entity);

    const result = await service.findOne('c1', 'p1');

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'p1', companyId: 'c1' },
      relations: ['department', 'currentRole', 'nextRole'],
    });
    expect(result).toEqual(entity);
  });

  it('findOne - not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('update', async () => {
    const existing = { id: 'p1', name: 'Old', companyId: 'c1' };
    const merged = { ...existing, name: 'New' };

    repo.findOne.mockResolvedValue(existing);
    repo.merge.mockReturnValue(merged);
    repo.save.mockResolvedValue(merged);

    const result = await service.update('c1', 'p1', { name: 'New' });

    expect(repo.merge).toHaveBeenCalledWith(existing, { name: 'New' });
    expect(result).toEqual(merged);
  });

  it('remove', async () => {
    const existing = { id: 'p1', companyId: 'c1' };

    repo.findOne.mockResolvedValue(existing);
    repo.remove.mockResolvedValue(existing);

    await service.remove('c1', 'p1');

    expect(repo.remove).toHaveBeenCalledWith(existing);
  });

  it('remove - not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.remove('c1', 'p1')).rejects.toThrow(NotFoundException);
  });
});
