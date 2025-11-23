import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctRoles: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(RolesController);
    service = module.get(RolesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Operador' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req: any = { user: { id: 'u1', companyId: 'c1' } };
    const query: any = {};

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
    const req: any = { user: { companyId: 'c1' } };
    service.findDistinctRoles.mockResolvedValue([{ id: 'r1' } as any]);

    const result = await controller.findDistinct(req);

    expect(service.findDistinctRoles).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 'r1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'r1' } as any);

    const result = await controller.findOne('r1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'r1');
    expect(result).toEqual({ id: 'r1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Supervisor' } as any;
    service.update.mockResolvedValue({ id: 'r1' } as any);

    const result = await controller.update('r1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'r1', dto);
    expect(result).toEqual({ id: 'r1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('r1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'r1');
  });
});
