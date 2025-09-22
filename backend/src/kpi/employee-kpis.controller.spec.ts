import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeKpisController } from './employee-kpis.controller';
import { EmployeeKpisService } from './employee-kpis.service';
import { KpiSource } from './entities/kpi.enums';

describe('EmployeeKpisController', () => {
  let controller: EmployeeKpisController;
  let service: jest.Mocked<EmployeeKpisService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const mockEntity: any = {
    id,
    companyId,
    employeeId: 'emp-1',
    kpiId: 'kpi-1',
    periodStart: '2025-09-01',
    periodEnd: '2025-09-30',
  };

  const serviceMock: jest.Mocked<EmployeeKpisService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeKpisController],
      providers: [{ provide: EmployeeKpisService, useValue: serviceMock }],
    }).compile();

    controller = module.get(EmployeeKpisController);
    service = module.get(EmployeeKpisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId, employeeId: 'emp-1', kpiId: 'kpi-1', evaluationTypeId: 'et-1',
      periodStart: '2025-09-01', periodEnd: '2025-09-30', source: KpiSource.MANAGER, submittedBy: 'user-1',
    } as any)).resolves.toEqual(mockEntity);
  });

  it('GET -> findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId, undefined, undefined, undefined))
      .resolves.toEqual([mockEntity]);
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, achievedValue: '25' });
    await expect(controller.update(id, companyId, { companyId, achievedValue: '25' } as any))
      .resolves.toEqual({ ...mockEntity, achievedValue: '25' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});