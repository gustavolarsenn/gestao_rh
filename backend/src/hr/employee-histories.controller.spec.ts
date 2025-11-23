import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeHistoriesController } from './employee-histories.controller';
import { EmployeeHistoriesService } from './employee-histories.service';

describe('EmployeeHistoriesController', () => {
  let controller: EmployeeHistoriesController;
  let service: jest.Mocked<EmployeeHistoriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeHistoriesController],
      providers: [
        {
          provide: EmployeeHistoriesService,
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

    controller = module.get(EmployeeHistoriesController);
    service = module.get(EmployeeHistoriesService);
  });

  it('POST create', async () => {
    const dto = { employeeId: 'e1', companyId: 'c1', hiringDate: '2024-01-01', startDate: '2024-01-01' };
    const mockHistory: any = { id: 'h1', ...dto };

    service.create.mockResolvedValue(mockHistory);

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockHistory);
  });

  it('GET findAll', async () => {
    const req: any = { user: { id: 'u1', companyId: 'c1' } };
    const query: any = { page: 1, limit: 10 };

    const mockReturn = {
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    };

    service.findAll.mockResolvedValue(mockReturn);

    const result = await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual(mockReturn);
  });

  it('GET findOne', async () => {
    const mockEntity = { id: 'h1' } as any;

    service.findOne.mockResolvedValue(mockEntity);

    const result = await controller.findOne('h1', 'c1');
    expect(service.findOne).toHaveBeenCalledWith('c1', 'h1');
    expect(result).toEqual(mockEntity);
  });

  it('PATCH update', async () => {
    const dto = { wage: '5000' };
    const mockEntity = { id: 'h1', ...dto } as any;

    service.update.mockResolvedValue(mockEntity);

    const result = await controller.update('h1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'h1', dto);
    expect(result).toEqual(mockEntity);
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('h1', 'c1');
    expect(service.remove).toHaveBeenCalledWith('c1', 'h1');
  });
});
