import { Test, TestingModule } from '@nestjs/testing';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';

describe('PersonsController', () => {
  let controller: PersonsController;
  let service: jest.Mocked<PersonsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonsController],
      providers: [
        {
          provide: PersonsService,
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

    controller = module.get(PersonsController);
    service = module.get(PersonsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { name: 'John' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req = { user: { id: 'u1', companyId: 'c1', level: 3 } } as any;
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

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'p1' } as any);

    const result = await controller.findOne('p1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'p1');
    expect(result).toEqual({ id: 'p1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'p1' } as any);

    const result = await controller.update('p1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'p1', dto);
    expect(result).toEqual({ id: 'p1' });
  });

  // DELETE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('p1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'p1');
  });
});
