import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsService } from './career-paths.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPath } from './entities/career-path.entity';

describe('CareerPathsService', () => {
  let service: CareerPathsService;
  let repo: jest.Mocked<Repository<CareerPath>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '44444444-4444-4444-4444-444444444444';

  const entity: CareerPath = Object.assign(new CareerPath(), {
    id,
    companyId,
    name: 'Engenharia → Sênior → Líder',
    description: 'Trilha de carreira padrão',
  });

  const repoMock: Partial<jest.Mocked<Repository<CareerPath>>> = {
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
        CareerPathsService,
        { provide: getRepositoryToken(CareerPath), useValue: repoMock },
      ],
    }).compile();

    service = module.get(CareerPathsService);
    repo = module.get(getRepositoryToken(CareerPath)) as jest.Mocked<Repository<CareerPath>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const result = await service.create({ companyId, name: 'Trilha' } as any);
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
    repo.merge.mockReturnValue({ ...entity, name: 'Nova Trilha' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Nova Trilha' } as any);

    const result = await service.update(companyId, id, { companyId, name: 'Nova Trilha' } as any);
    expect(result.name).toBe('Nova Trilha');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});