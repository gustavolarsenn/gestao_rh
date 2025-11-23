import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctDepartments: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(DepartmentsController);
    service = module.get(DepartmentsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Operations' } as any;
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

    service.findDistinctDepartments.mockResolvedValue([{ id: 'd1' } as any]);

    const result = await controller.findDistinct(req);

    expect(service.findDistinctDepartments).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 'd1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'd1' } as any);

    const result = await controller.findOne('d1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'd1');
    expect(result).toEqual({ id: 'd1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'd1' } as any);

    const result = await controller.update('d1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'd1', dto);
    expect(result).toEqual({ id: 'd1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('d1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'd1');
  });
});
