import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: jest.Mocked<TeamsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctTeams: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TeamsController);
    service = module.get(TeamsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Team A' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req = { user: { id: 'u1', role: 'admin', companyId: 'c1' } };
    const query = { page: 1, limit: 10 } as any;

    service.findAll.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });
  });

  // DISTINCT
  it('GET distinct', async () => {
    service.findDistinctTeams.mockResolvedValue([{ id: 't1' }] as any);

    const req = { user: { id: 'u1' } };

    const result = await controller.findDistinctTeams(req);

    expect(service.findDistinctTeams).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 't1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 't1' } as any);

    const result = await controller.findOne('t1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 't1');
    expect(result).toEqual({ id: 't1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { description: 'new' } as any;
    service.update.mockResolvedValue({ id: 't1' } as any);

    const result = await controller.update('t1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 't1', dto);
    expect(result).toEqual({ id: 't1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('t1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 't1');
  });
});
