import { Test, TestingModule } from '@nestjs/testing';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';

describe('TeamMembersController', () => {
  let controller: TeamMembersController;
  let service: jest.Mocked<TeamMembersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMembersController],
      providers: [
        {
          provide: TeamMembersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TeamMembersController);
    service = module.get(TeamMembersService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { teamId: 't1' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req = { user: { id: 'u1', companyId: 'c1' } } as any;

    service.findAll.mockResolvedValue([]);

    const result = await controller.findAll(req, 't1', 'e1', 'p1', 'true');

    expect(service.findAll).toHaveBeenCalledWith(req.user, {
      teamId: 't1',
      employeeId: 'e1',
      parentTeamId: 'p1',
      active: true,
    });
    expect(result).toEqual([]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'm1' } as any);

    const result = await controller.findOne('m1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'm1');
    expect(result).toEqual({ id: 'm1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { isLeader: true } as any;
    service.update.mockResolvedValue({ id: 'm1' } as any);

    const result = await controller.update('m1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'm1', dto);
    expect(result).toEqual({ id: 'm1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('m1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'm1');
  });
});
