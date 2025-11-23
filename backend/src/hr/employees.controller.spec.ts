import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: jest.Mocked<EmployeesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
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

    controller = module.get(EmployeesController);
    service = module.get(EmployeesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST create', async () => {
    const dto = { name: 'John' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

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
      data: []
    });
  });

  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'e1' } as any);

    const result = await controller.findOne('e1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'e1');
    expect(result).toEqual({ id: 'e1' });
  });

  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'e1' } as any);

    const result = await controller.update('e1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'e1', dto);
    expect(result).toEqual({ id: 'e1' });
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('e1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'e1');
  });
});
