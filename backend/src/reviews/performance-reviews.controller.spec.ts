import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceReviewsController } from './performance-reviews.controller';
import { PerformanceReviewsService } from './performance-reviews.service';

describe('PerformanceReviewsController', () => {
  let controller: PerformanceReviewsController;
  let service: jest.Mocked<PerformanceReviewsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceReviewsController],
      providers: [
        {
          provide: PerformanceReviewsService,
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

    controller = module.get(PerformanceReviewsController);
    service = module.get(PerformanceReviewsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const req = { user: { employeeId: 'leader1' } } as any;
    const dto = { employeeId: 'emp1', date: '2024-01-02' } as any;

    service.create.mockResolvedValue({ id: 'rev1' } as any);

    const result = await controller.create(req, dto);

    expect(service.create).toHaveBeenCalledWith(req.user, dto);
    expect(result).toEqual({ id: 'rev1' });
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req = { user: { companyId: 'c1' } } as any;

    const query = {};
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

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'rev1' } as any);

    const result = await controller.findOne('rev1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'rev1');
    expect(result).toEqual({ id: 'rev1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { observation: 'Updated' } as any;

    service.update.mockResolvedValue({ id: 'rev1' } as any);

    const result = await controller.update('rev1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'rev1', dto);
    expect(result).toEqual({ id: 'rev1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('rev1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'rev1');
  });
});
