import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: jest.Mocked<CompaniesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
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

    controller = module.get(CompaniesController);
    service = module.get(CompaniesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'ZPORT' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const query: any = {};
    const req: any = {
      user: {
        level: 4,
        companyId: 'company-1',
      },
    };

    service.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 0,
    });

    // ✅ agora passamos req e query, como está definido no controller
    const result = await controller.findAll(req, query);

    // ✅ o controller faz this.service.findAll(req.user, query);
    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 0,
    });
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'c1' } as any);

    const result = await controller.findOne('c1');

    expect(service.findOne).toHaveBeenCalledWith('c1');
    expect(result).toEqual({ id: 'c1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;

    service.update.mockResolvedValue({ id: 'c1' } as any);

    const result = await controller.update('c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', dto);
    expect(result).toEqual({ id: 'c1' });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('c1');

    expect(service.remove).toHaveBeenCalledWith('c1');
  });
});
