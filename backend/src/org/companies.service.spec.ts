import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repo: jest.Mocked<Repository<Company>>;

  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const entity: Company = Object.assign(new Company(), { id, name: 'Acme Inc.' });

  const repoMock: Partial<jest.Mocked<Repository<Company>>> = {
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
        CompaniesService,
        { provide: getRepositoryToken(Company), useValue: repoMock },
      ],
    }).compile();

    service = module.get(CompaniesService);
    repo = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
  });

  it('create', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ name: 'Acme Inc.' } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(res).toEqual(entity);
  });

  it('findAll', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll();
    expect(repo.find).toHaveBeenCalledWith();
    expect(res).toEqual([entity]);
  });

  it('findOne', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(id);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id } });
    expect(res).toEqual(entity);
  });

  it('update', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, name: 'Acme LLC' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Acme LLC' } as any);
    const res = await service.update(id, { name: 'Acme LLC' } as any);
    expect(res.name).toBe('Acme LLC');
  });

  it('remove', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(id)).resolves.toBeUndefined();
  });
});