import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: jest.Mocked<EmployeesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '22222222-2222-2222-2222-222222222222';

  const mockEntity: any = {
    id,
    companyId,
    name: 'John Doe',
  };

  const serviceMock: jest.Mocked<EmployeesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(EmployeesController);
    service = module.get(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /employees -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'John Doe' } as any)).resolves.toEqual(mockEntity);
    expect(service.create).toHaveBeenCalled();
  });

  it('GET /employees -> findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId)).resolves.toEqual([mockEntity]);
    expect(service.findAll).toHaveBeenCalledWith(companyId);
  });

  it('GET /employees/:id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
    expect(service.findOne).toHaveBeenCalledWith(companyId, id);
  });

  it('PATCH /employees/:id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, name: 'Updated' });
    await expect(controller.update(id, companyId, { companyId, name: 'Updated' } as any)).resolves.toEqual({ ...mockEntity, name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith(companyId, id, { companyId, name: 'Updated' });
  });

  it('DELETE /employees/:id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(companyId, id);
  });
});