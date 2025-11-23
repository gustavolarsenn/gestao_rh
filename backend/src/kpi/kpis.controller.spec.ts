import { Test, TestingModule } from '@nestjs/testing';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';

describe('KpisController', () => {
  let controller: KpisController;
  let service: jest.Mocked<KpisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpisController],
      providers: [
        {
          provide: KpisService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctKpis: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(KpisController);
    service = module.get(KpisService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'KPI Test' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req: any = { user: { id: 'u1', companyId: 'c1' } };
    const query: any = {};

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

  // DISTINCT
  it('GET distinct', async () => {
    const req: any = { user: { companyId: 'c1' } };
    service.findDistinctKpis.mockResolvedValue([{ id: 'k1' }] as any);

    const result = await controller.findDistinctKpis(req);

    expect(service.findDistinctKpis).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 'k1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'k1' } as any);

    const result = await controller.findOne('k1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'k1');
    expect(result).toEqual({ id: 'k1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'k1' } as any);

    const result = await controller.update('k1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'k1', dto);
    expect(result).toEqual({ id: 'k1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('k1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'k1');
  });
});
