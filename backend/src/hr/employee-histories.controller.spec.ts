import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeHistoriesController } from './employee-histories.controller';
import { EmployeeHistoriesService } from './employee-histories.service';

describe('EmployeeHistoriesController', () => {
  let controller: EmployeeHistoriesController;
  let service: jest.Mocked<EmployeeHistoriesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '33333333-3333-3333-3333-333333333333';

  const mockEntity: any = {
    id,
    companyId,
    employeeId: 'emp-1',
    roleId: 'role-1',
    wage: '1000.00',
    startDate: '2025-01-01',
  };

  const serviceMock: jest.Mocked<EmployeeHistoriesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeHistoriesController],
      providers: [{ provide: EmployeeHistoriesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(EmployeeHistoriesController);
    service = module.get(EmployeeHistoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId, employeeId: 'emp-1', startDate: '2025-01-01',
    } as any)).resolves.toEqual(mockEntity);
  });

  it('GET -> findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId)).resolves.toEqual([mockEntity]);
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, wage: '1200.00' });
    await expect(controller.update(id, companyId, { companyId, wage: '1200.00' } as any))
      .resolves.toEqual({ ...mockEntity, wage: '1200.00' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});