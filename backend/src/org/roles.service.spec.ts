import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

describe('RolesService', () => {
  let service: RolesService;
  let repo: jest.Mocked<Repository<Role>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  const entity: Role = Object.assign(new Role(), { id, companyId, name: 'Engenheiro' });

  const repoMock: Partial<jest.Mocked<Repository<Role>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: repoMock },
      ],
    }).compile();

    service = module.get(RolesService);
    repo = module.get(getRepositoryToken(Role)) as jest.Mocked<Repository<Role>>;
  });

  it('create', async () => {
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'Engenheiro' } as any);
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
    repo.merge.mockReturnValue({ ...entity, name: 'SRE' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'SRE' } as any);
    const res = await service.update(companyId, id, { companyId, name: 'SRE' } as any);
    expect(res.name).toBe('SRE');
  });

  it('remove', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});