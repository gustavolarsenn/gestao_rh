import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceReviewsController } from './performance-reviews.controller';
import { PerformanceReviewsService } from './performance-reviews.service';

describe('PerformanceReviewsController', () => {
  let controller: PerformanceReviewsController;
  let service: jest.Mocked<PerformanceReviewsService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const mockEntity: any = {
    id,
    companyId,
    employeeId: 'emp-1',
    leaderId: 'emp-2',
    observation: 'Ótimo desempenho',
    date: '2025-09-01',
  };

  const serviceMock: jest.Mocked<PerformanceReviewsService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceReviewsController],
      providers: [{ provide: PerformanceReviewsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(PerformanceReviewsController);
    service = module.get(PerformanceReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId,
      employeeId: 'emp-1',
      leaderId: 'emp-2',
      observation: 'Ótimo desempenho',
      date: '2025-09-01',
    })).resolves.toEqual(mockEntity);
    expect(service.create).toHaveBeenCalled();
  });

  it('GET -> findAll (com filtros)', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(
      controller.findAll(companyId, 'emp-1', 'emp-2', '2025-09-01', '2025-09-30'),
    ).resolves.toEqual([mockEntity]);
    expect(service.findAll).toHaveBeenCalledWith(companyId, {
      employeeId: 'emp-1',
      leaderId: 'emp-2',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
    });
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
    expect(service.findOne).toHaveBeenCalledWith(companyId, id);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, observation: 'Excelente' });
    await expect(
      controller.update(id, companyId, { companyId, observation: 'Excelente' } as any),
    ).resolves.toEqual({ ...mockEntity, observation: 'Excelente' });
    expect(service.update).toHaveBeenCalledWith(
      companyId,
      id,
      { companyId, observation: 'Excelente' },
    );
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(companyId, id);
  });
});