import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeHistoriesService } from './employee-histories.service';
import { EmployeeHistory } from './entities/employee-history.entity';
import { NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

jest.mock('../common/utils/scoped-query.util', () => ({
  applyScope: () => ({ companyId: 'c1' }),
}));

describe('EmployeeHistoriesService', () => {
  let service: EmployeeHistoriesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeHistoriesService,
        {
          provide: getRepositoryToken(EmployeeHistory),
          useValue: mockRepo(),
        },
      ],
    }).compile();

    service = module.get(EmployeeHistoriesService);
    repo = module.get(getRepositoryToken(EmployeeHistory));
  });

  it('create', async () => {
    const dto = { employeeId: 'e1', companyId: 'c1', hiringDate: '2024-01-01', startDate: '2024-01-01' };
    const entity = { id: 'h1', ...dto };

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll with pagination', async () => {
    const mockReturn = [[{ id: 'h1' }], 1];

    repo.findAndCount.mockResolvedValue(mockReturn);

    const result = await service.findAll({ companyId: 'c1' }, { page: '1', limit: '10' });

    expect(repo.findAndCount).toHaveBeenCalled();
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      data: [{ id: 'h1' }],
    });
  });

  it('findOne - success', async () => {
    const entity = { id: 'h1', companyId: 'c1' };
    repo.findOne.mockResolvedValue(entity);

    const result = await service.findOne('c1', 'h1');
    expect(result).toEqual(entity);
  });

  it('findOne - not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne('c1', 'h1')).rejects.toThrow(NotFoundException);
  });

  it('update', async () => {
    const existing = { id: 'h1', companyId: 'c1' };
    const merged = { id: 'h1', wage: '5000' };

    repo.findOne.mockResolvedValue(existing);
    repo.merge.mockReturnValue(merged);
    repo.save.mockResolvedValue(merged);

    const result = await service.update('c1', 'h1', { wage: '5000' });

    expect(repo.merge).toHaveBeenCalledWith(existing, { wage: '5000' });
    expect(result).toEqual(merged);
  });

  it('remove', async () => {
    const existing = { id: 'h1', companyId: 'c1' };

    repo.findOne.mockResolvedValue(existing);
    repo.remove.mockResolvedValue(existing);

    await service.remove('c1', 'h1');

    expect(repo.remove).toHaveBeenCalledWith(existing);
  });

  it('remove - not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.remove('c1', 'h1')).rejects.toThrow(NotFoundException);
  });
});
