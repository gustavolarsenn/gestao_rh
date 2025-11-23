import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypesController } from './role-types.controller';
import { RoleTypesService } from './role-types.service';

describe('RoleTypesController', () => {
  let controller: RoleTypesController;
  let service: jest.Mocked<RoleTypesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleTypesController],
      providers: [
        {
          provide: RoleTypesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctRoleTypes: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(RoleTypesController);
    service = module.get(RoleTypesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Supervisor' } as any;
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
    const req: any = { user: { id: 'u1', companyId: 'c1' } };

    service.findDistinctRoleTypes.mockResolvedValue([{ id: 'rt1' } as any]);

    const result = await controller.findDistinct(req);

    expect(service.findDistinctRoleTypes).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 'rt1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'rt1' } as any);

    const result = await controller.findOne('rt1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'rt1');
    expect(result).toEqual({ id: 'rt1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'rt1' } as any);

    const result = await controller.update('rt1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'rt1', dto);
    expect(result).toEqual({ id: 'rt1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('rt1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'rt1');
  });
});
