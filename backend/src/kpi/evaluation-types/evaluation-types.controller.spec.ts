import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationTypesController } from './evaluation-types.controller';
import { EvaluationTypesService } from './evaluation-types.service';

describe('EvaluationTypesController', () => {
  let controller: EvaluationTypesController;
  let service: jest.Mocked<EvaluationTypesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationTypesController],
      providers: [
        {
          provide: EvaluationTypesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctEvaluationTypes: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(EvaluationTypesController);
    service = module.get(EvaluationTypesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Percentual' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req: any = { user: { companyId: 'c1' } };
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

  // FIND DISTINCT
  it('GET /distinct', async () => {
    const req: any = { user: { companyId: 'c1' } };
    service.findDistinctEvaluationTypes.mockResolvedValue([{ id: 't1' }] as any);

    const result = await controller.findDistinctEvaluationTypes(req);

    expect(service.findDistinctEvaluationTypes).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 't1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 't1' } as any);

    const result = await controller.findOne('t1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 't1');
    expect(result).toEqual({ id: 't1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;

    service.update.mockResolvedValue({ id: 't1' } as any);

    const result = await controller.update('t1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 't1', dto);
    expect(result).toEqual({ id: 't1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('t1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 't1');
  });
});
