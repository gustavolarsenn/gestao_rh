import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

describe('BranchesController', () => {
  let controller: BranchesController;
  let service: jest.Mocked<BranchesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [
        {
          provide: BranchesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findDistinctBranches: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(BranchesController);
    service = module.get(BranchesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'Filial Teste' } as any;
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
  it('GET /distinct', async () => {
    const req: any = { user: { companyId: 'c1' } };
    service.findDistinctBranches.mockResolvedValue([{ id: 'b1' }] as any);

    const result = await controller.findDistinct(req);

    expect(service.findDistinctBranches).toHaveBeenCalledWith(req.user);
    expect(result).toEqual([{ id: 'b1' }]);
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'b1' } as any);

    const result = await controller.findOne('b1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'b1');
    expect(result).toEqual({ id: 'b1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'b1' } as any);

    const result = await controller.update('b1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'b1', dto);
    expect(result).toEqual({ id: 'b1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('b1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'b1');
  });
});
