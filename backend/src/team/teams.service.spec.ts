import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

describe('TeamsService', () => {
  let service: TeamsService;
  let repo: jest.Mocked<Repository<Team>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const entity: Team = Object.assign(new Team(), {
    id, companyId, name: 'Plataforma',
  });

  const repoMock: Partial<jest.Mocked<Repository<Team>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: repoMock },
      ],
    }).compile();

    service = module.get(TeamsService);
    repo = module.get(getRepositoryToken(Team)) as jest.Mocked<Repository<Team>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves team', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const res = await service.create({ companyId, name: 'Plataforma' } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(res).toEqual(entity);
  });

  it('findAll -> list by company', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll(companyId);
    expect(repo.find).toHaveBeenCalledWith({ where: { companyId } });
    expect(res).toEqual([entity]);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(companyId, id);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { companyId, id } });
    expect(res).toEqual(entity);
  });

  it('update -> merges', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, name: 'Core' } as any);
    repo.save.mockResolvedValue({ ...entity, name: 'Core' } as any);
    const res = await service.update(companyId, id, { companyId, name: 'Core' } as any);
    expect(res.name).toBe('Core');
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});