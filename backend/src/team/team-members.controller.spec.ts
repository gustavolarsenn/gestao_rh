import { Test, TestingModule } from '@nestjs/testing';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';

describe('TeamMembersController', () => {
  let controller: TeamMembersController;
  let service: jest.Mocked<TeamMembersService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const mockEntity: any = {
    id,
    companyId,
    teamId: 'team-1',
    employeeId: 'emp-1',
    parentTeamId: 'team-root',
    active: true,
  };

  const serviceMock: jest.Mocked<TeamMembersService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMembersController],
      providers: [{ provide: TeamMembersService, useValue: serviceMock }],
    }).compile();

    controller = module.get(TeamMembersController);
    service = module.get(TeamMembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId, teamId: 'team-1', employeeId: 'emp-1', parentTeamId: 'team-root', active: true,
    } as any)).resolves.toEqual(mockEntity);
  });

  it('GET -> findAll (with filters)', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId, 'team-1', undefined, 'team-root', 'true'))
      .resolves.toEqual([mockEntity]);
    expect(service.findAll).toHaveBeenCalledWith(companyId, {
      teamId: 'team-1',
      employeeId: undefined,
      parentTeamId: 'team-root',
      active: true,
    });
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, active: false });
    await expect(controller.update(id, companyId, { companyId, active: false } as any))
      .resolves.toEqual({ ...mockEntity, active: false });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});