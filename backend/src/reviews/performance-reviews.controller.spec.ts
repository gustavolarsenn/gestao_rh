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
            createToEmployee: jest.fn(),
            createToLeader: jest.fn(),
            findAllToEmployee: jest.fn(),
            findAllToLeader: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(PerformanceReviewsController);
    service = module.get(
      PerformanceReviewsService,
    ) as jest.Mocked<PerformanceReviewsService>;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE TO EMPLOYEE
  it('POST /employee createToEmployee', async () => {
    const req = { user: { employeeId: 'leader1' } } as any;
    const dto = { employeeId: 'emp1', date: '2024-01-02' } as any;

    service.createToEmployee.mockResolvedValue({ id: 'rev1' } as any);

    const result = await controller.createToEmployee(req, dto);

    expect(service.createToEmployee).toHaveBeenCalledWith(req.user, dto);
    expect(result).toEqual({ id: 'rev1' });
  });

  // CREATE TO LEADER
  it('POST /leader createToLeader', async () => {
    const req = { user: { employeeId: 'emp1', teamId: 'team1' } } as any;
    const dto = { date: '2024-01-02' } as any;

    service.createToLeader.mockResolvedValue({ id: 'rev2' } as any);

    const result = await controller.createToLeader(req, dto);

    expect(service.createToLeader).toHaveBeenCalledWith(req.user, dto);
    expect(result).toEqual({ id: 'rev2' });
  });

  // FIND ALL TO EMPLOYEE
  it('GET /employee findAllToEmployee', async () => {
    const req = { user: { companyId: 'c1', employeeId: 'e1' } } as any;
    const query: any = {};

    service.findAllToEmployee.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await controller.findAllToEmployee(req, query);

    expect(service.findAllToEmployee).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });
  });

  // FIND ALL TO LEADER
  it('GET /leader findAllToLeader', async () => {
    const req = { user: { companyId: 'c1', teamId: 't1' } } as any;
    const query: any = {};

    service.findAllToLeader.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await controller.findAllToLeader(req, query);

    expect(service.findAllToLeader).toHaveBeenCalledWith(req.user, query);
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
