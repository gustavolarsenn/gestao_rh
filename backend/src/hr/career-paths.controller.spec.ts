import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsController } from './career-paths.controller';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsController', () => {
  let controller: CareerPathsController;
  let service: jest.Mocked<CareerPathsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerPathsController],
      providers: [
        {
          provide: CareerPathsService,
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

    controller = module.get(CareerPathsController);
    service = module.get(CareerPathsService);
  });

  it('POST create', async () => {
    const dto = { name: 'Teste', companyId: 'c1', currentRoleId: 'r1', nextRoleId: 'r2', departmentId: 'd1' } as any;
    const mock = [{ id: 'p1', ...dto }];

    service.create.mockResolvedValue(mock);

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mock);
  });

  it('GET findAll', async () => {
    const mock = [{ id: 'p1' }] as any;

    service.findAll.mockResolvedValue(mock);

    const result = await controller.findAll('c1', 'd1', 'r1');

    expect(service.findAll).toHaveBeenCalledWith('c1', {
      departmentId: 'd1',
      currentRoleId: 'r1',
    });
    expect(result).toEqual(mock);
  });

  it('GET findOne', async () => {
    const mock = { id: 'p1' } as any;

    service.findOne.mockResolvedValue(mock);

    const result = await controller.findOne('c1', 'p1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'p1');
    expect(result).toEqual(mock);
  });

  it('PATCH update', async () => {
    const dto = { name: 'Updated' };
    const mock = { id: 'p1', ...dto } as any;

    service.update.mockResolvedValue(mock);

    const result = await controller.update('c1', 'p1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'p1', dto);
    expect(result).toEqual(mock);
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('c1', 'p1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'p1');
  });
});
