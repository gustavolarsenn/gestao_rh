import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpisService } from './kpis.service';
import { KPI } from './entities/kpi.entity';

describe('KpisService', () => {
  let service: KpisService;
  let repo: jest.Mocked<Repository<KPI>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const entity: KPI = Object.assign(new KPI(), {
    id,
    companyId,
    name: 'Bugs Corrigidos',
    description: 'Qtd. mensal',
    evaluationTypeId: 'et-1',
    active: true,
  });

  const repoMock: Partial<jest.Mocked<Repository<KPI>>> = {
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
        KpisService,
        { provide: getRepositoryToken(KPI), useValue: repoMock },
      ],
    }).compile();

    service = module.get(KpisService);
    repo = module.get(getRepositoryToken(KPI)) as jest.Mocked<Repository<KPI>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves KPI', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create({
      companyId,
      name: 'Bugs Corrigidos',
      evaluationTypeId: 'et-1',
      active: true,
    } as any);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  it('findAll -> by company', async () => {
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

  it('update -> merges and saves', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, name: 'Bugs Corrigidos (Mês)' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Bugs Corrigidos (Mês)' } as any);

    const result = await service.update(companyId, id, { companyId, name: 'Bugs Corrigidos (Mês)' } as any);
    expect(result.name).toBe('Bugs Corrigidos (Mês)');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});