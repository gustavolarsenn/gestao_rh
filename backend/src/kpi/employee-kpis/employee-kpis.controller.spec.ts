import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeKpisController } from './employee-kpis.controller';
import { EmployeeKpisService } from './employee-kpis.service';

describe('EmployeeKpisController', () => {
  let controller: EmployeeKpisController;
  let service: jest.Mocked<EmployeeKpisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeKpisController],
      providers: [
        {
          provide: EmployeeKpisService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            approve: jest.fn(),
            reject: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(EmployeeKpisController);
    service = module.get(EmployeeKpisService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { employeeId: 'e1' } as any;
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

    const result = await controller.findAll(query, req);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'k1' } as any);

    const result = await controller.findOne('k1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'k1');
    expect(result).toEqual({ id: 'k1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { goal: '10' } as any;
    service.update.mockResolvedValue({ id: 'k1' } as any);

    const result = await controller.update('k1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'k1', dto);
    expect(result).toEqual({ id: 'k1' });
  });

  // APPROVE
  it('POST approve', async () => {
    service.approve.mockResolvedValue({ id: 'k1', status: 'APPROVED' } as any);

    const result = await controller.approve('k1', 'c1', 'u1');

    expect(service.approve).toHaveBeenCalledWith('c1', 'k1', 'u1');
    expect(result).toEqual({ id: 'k1', status: 'APPROVED' });
  });

  // REJECT
  it('POST reject', async () => {
    service.reject.mockResolvedValue({ id: 'k1', status: 'REJECTED' } as any);

    const result = await controller.reject('k1', 'c1', 'u1', 'Bad');

    expect(service.reject).toHaveBeenCalledWith('c1', 'k1', 'u1', 'Bad');
    expect(result).toEqual({ id: 'k1', status: 'REJECTED' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('k1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'k1');
  });
});
