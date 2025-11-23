import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
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

    controller = module.get(UsersController);
    service = module.get(UsersService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST create', async () => {
    const dto = { name: 'User' } as any;
    const mock = { id: 'u1', ...dto };
    service.create.mockResolvedValue(mock);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mock);
  });

  it('GET findAll', async () => {
    const req = { user: { companyId: 'c1' } };
    const query = { name: 'A' } as any;

    service.findAll.mockResolvedValue([{ id: 'u1' }] as any);

    const result = await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual([{ id: 'u1' }]);
  });

  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'u1' } as any);

    const result = await controller.findOne('u1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'u1');
    expect(result).toEqual({ id: 'u1' });
  });

  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;

    service.update.mockResolvedValue({ id: 'u1' } as any);

    const result = await controller.update('u1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'u1', dto);
    expect(result).toEqual({ id: 'u1' });
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('u1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'u1');
  });
});
