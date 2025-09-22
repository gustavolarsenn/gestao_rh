// src/org/role-types.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypesService } from './role-types.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleType } from './entities/role-type.entity';

describe('RoleTypesService', () => {
  let service: RoleTypesService;
  let repo: jest.Mocked<Repository<RoleType>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  const entity: RoleType = Object.assign(new RoleType(), { id, companyId, name: 'CLT' });

  const repoMock: Partial<jest.Mocked<Repository<RoleType>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleTypesService,
        { provide: getRepositoryToken(RoleType), useValue: repoMock },
      ],
    }).compile();

    service = module.get(RoleTypesService);
    repo = module.get(getRepositoryToken(RoleType)) as jest.Mocked<Repository<RoleType>>;
  });

  it('create', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'CLT' } as any);
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
    repo.merge.mockReturnValue({ ...entity, name: 'PJ' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'PJ' } as any);
    const res = await service.update(companyId, id, { companyId, name: 'PJ' } as any);
    expect(res.name).toBe('PJ');
  });

  it('remove', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});