import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeKpiEvolutionsController } from './employee-kpi-evolutions.controller';
import { EmployeeKpiEvolutionsService } from './employee-kpi-evolutions.service';
import { KpiStatus } from '../entities/kpi.enums';

describe('EmployeeKpiEvolutionsController', () => {
  let controller: EmployeeKpiEvolutionsController;
  let service: jest.Mocked<EmployeeKpiEvolutionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeKpiEvolutionsController],
      providers: [
        {
          provide: EmployeeKpiEvolutionsService,
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

    controller = module.get(EmployeeKpiEvolutionsController);
    service = module.get(EmployeeKpiEvolutionsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // ======================================================
  // CREATE
  // ======================================================
  it('POST create', async () => {
    const dto = { employeeKpiId: 'k1' } as any;
    const req = { user: { id: 'u1' } } as any;

    service.create.mockResolvedValue({ id: 'evo1' } as any);

    const result = await controller.create(dto, req);

    expect(service.create).toHaveBeenCalledWith(dto, req);
    expect(result).toEqual({ id: 'evo1' });
  });

  // ======================================================
  // FIND ALL
  // ======================================================
  it('GET findAll', async () => {
    const req: any = { user: { companyId: 'c1' } };
    const query: any = {};

    service.findAll.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({ page: 1, limit: 10, total: 0, data: [] });
  });

  // ======================================================
  // FIND ONE
  // ======================================================
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'evo1' } as any);

    const result = await controller.findOne('evo1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'evo1');
    expect(result).toEqual({ id: 'evo1' });
  });

  // ======================================================
  // UPDATE
  // ======================================================
  it('PATCH update', async () => {
    const dto = { achievedValueEvolution: '10' } as any;
    service.update.mockResolvedValue({ id: 'evo1' } as any);

    const result = await controller.update('evo1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'evo1', dto);
    expect(result).toEqual({ id: 'evo1' });
  });

  // ======================================================
  // APPROVE
  // ======================================================
  it('POST approve', async () => {
    const req: any = { user: { id: 'u1' } };
    service.approve.mockResolvedValue({ id: 'evo1', status: KpiStatus.APPROVED } as any);

    const result = await controller.approve('evo1', 'c1', req);

    expect(service.approve).toHaveBeenCalledWith('c1', 'evo1', req);
    expect(result.status).toBe(KpiStatus.APPROVED);
  });

  // ======================================================
  // REJECT
  // ======================================================
  it('POST reject', async () => {
    const req: any = { user: { id: 'u1' } };
    service.reject.mockResolvedValue({ id: 'evo1', status: KpiStatus.REJECTED } as any);

    const result = await controller.reject('evo1', 'c1', req, 'bad');

    expect(service.reject).toHaveBeenCalledWith('c1', 'evo1', req, 'bad');
    expect(result.status).toBe(KpiStatus.REJECTED);
  });

  // ======================================================
  // REMOVE
  // ======================================================
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('evo1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'evo1');
  });
});
