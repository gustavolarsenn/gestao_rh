import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  const mockEntity: any = { id, companyId, name: 'Engenharia' };

  const serviceMock: jest.Mocked<DepartmentsService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [{ provide: DepartmentsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(DepartmentsController);
    service = module.get(DepartmentsService);
  });

  it('POST', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Engenharia' } as any))
      .resolves.toEqual(mockEntity);
  });

  it('GET', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId)).resolves.toEqual([mockEntity]);
  });

  it('GET :id', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id', async () => {
    service.update.mockResolvedValue({ ...mockEntity, name: 'Produto' });
    await expect(controller.update(id, companyId, { companyId, name: 'Produto' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Produto' });
  });

  it('DELETE :id', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});