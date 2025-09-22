import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationTypesService } from './evaluation-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationType } from './entities/evaluation-type.entity';

describe('EvaluationTypesService', () => {
  let service: EvaluationTypesService;
  let repo: jest.Mocked<Repository<EvaluationType>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaa1-2222-3333-4444-555555555555';

  const entity: EvaluationType = Object.assign(new EvaluationType(), {
    id,
    companyId,
    name: 'Maior Melhor',
    code: 'HIGHER_BETTER',
    description: '...',
  });

  const repoMock: Partial<jest.Mocked<Repository<EvaluationType>>> = {
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
        EvaluationTypesService,
        { provide: getRepositoryToken(EvaluationType), useValue: repoMock },
      ],
    }).compile();

    service = module.get(EvaluationTypesService);
    repo = module.get(getRepositoryToken(EvaluationType)) as jest.Mocked<Repository<EvaluationType>>;
  });

  it('create -> saves', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'Maior Melhor', code: 'HIGHER_BETTER' } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(res).toEqual(entity);
  });

  it('findAll -> list', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll(companyId);
    expect(repo.find).toHaveBeenCalledWith({ where: { companyId } });
    expect(res).toEqual([entity]);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(companyId, id);
    expect(res).toEqual(entity);
  });

  it('update -> merges', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, description: 'upd' } as any);
    repo.save.mockResolvedValue({ ...entity, description: 'upd' } as any);
    const res = await service.update(companyId, id, { companyId, description: 'upd' } as any);
    expect(res.description).toBe('upd');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});