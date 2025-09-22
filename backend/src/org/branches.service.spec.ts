// src/org/branches.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

describe('BranchesService', () => {
  let service: BranchesService;
  let repo: jest.Mocked<Repository<Branch>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const entity: Branch = Object.assign(new Branch(), {
    id, companyId, name: 'Filial SP',
  });

  const repoMock: Partial<jest.Mocked<Repository<Branch>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: getRepositoryToken(Branch), useValue: repoMock },
      ],
    }).compile();

    service = module.get(BranchesService);
    repo = module.get(getRepositoryToken(Branch)) as jest.Mocked<Repository<Branch>>;
  });

  it('create', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'Filial SP' } as any);
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
    repo.merge.mockReturnValue({ ...entity, name: 'Filial RJ' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Filial RJ' } as any);
    const res = await service.update(companyId, id, { companyId, name: 'Filial RJ' } as any);
    expect(res.name).toBe('Filial RJ');
  });

  it('remove', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});