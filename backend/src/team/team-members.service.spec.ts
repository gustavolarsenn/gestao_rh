import { Test, TestingModule } from '@nestjs/testing';
import { TeamMembersService } from './team-members.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';

describe('TeamMembersService', () => {
  let service: TeamMembersService;
  let repo: jest.Mocked<Repository<TeamMember>>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const entity: TeamMember = Object.assign(new TeamMember(), {
    id,
    companyId,
    teamId: 'team-1',
    employeeId: 'emp-1',
    parentTeamId: 'team-root',
    active: true,
  });

  const repoMock: Partial<jest.Mocked<Repository<TeamMember>>> = {
    findOne: jest.fn(), find: jest.fn(), save: jest.fn(),
    create: jest.fn(), remove: jest.fn(), merge: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repoMock).forEach((fn) => (fn as any)?.mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembersService,
        { provide: getRepositoryToken(TeamMember), useValue: repoMock },
      ],
    }).compile();

    service = module.get(TeamMembersService);
    repo = module.get(getRepositoryToken(TeamMember)) as jest.Mocked<Repository<TeamMember>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create -> saves member (no conflict)', async () => {
    repo.findOne.mockResolvedValue(null as any);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const res = await service.create({
      companyId,
      teamId: 'team-1',
      employeeId: 'emp-1',
      parentTeamId: 'team-root',
      active: true,
    } as any);

    expect(repo.findOne).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(res).toEqual(entity);
  });

  it('findAll -> with filters', async () => {
    repo.find.mockResolvedValue([entity] as any);
    const res = await service.findAll(companyId, { teamId: 'team-1', active: true });
    expect(repo.find).toHaveBeenCalledWith({ where: { companyId, teamId: 'team-1', active: true } });
    expect(res).toEqual([entity]);
  });

  it('findOne -> ok', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    const res = await service.findOne(companyId, id);
    expect(res).toEqual(entity);
  });

  it('update -> merges', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.merge.mockReturnValue({ ...entity, active: false } as any);
    repo.save.mockResolvedValue({ ...entity, active: false } as any);

    const res = await service.update(companyId, id, { companyId, active: false } as any);
    expect(res.active).toBe(false);
  });

  it('remove -> deletes', async () => {
    repo.findOne.mockResolvedValue(entity as any);
    repo.remove.mockResolvedValue(entity as any);
    await expect(service.remove(companyId, id)).resolves.toBeUndefined();
  });
});