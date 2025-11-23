import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';

describe('UserRolesController', () => {
  let controller: UserRolesController;
  let service: jest.Mocked<UserRolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRolesController],
      providers: [
        {
          provide: UserRolesService,
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

    controller = module.get(UserRolesController);
    service = module.get(UserRolesService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST create', async () => {
    const dto = { name: 'Admin' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  it('GET findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 'r1' }] as any);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'r1' }]);
  });

  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'r1' } as any);

    const result = await controller.findOne('r1');

    expect(service.findOne).toHaveBeenCalledWith('r1');
    expect(result).toEqual({ id: 'r1' });
  });

  it('PATCH update', async () => {
    const dto = { name: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'r1' } as any);

    const result = await controller.update('r1', dto);

    expect(service.update).toHaveBeenCalledWith('r1', dto);
    expect(result).toEqual({ id: 'r1' });
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('r1');

    expect(service.remove).toHaveBeenCalledWith('r1');
  });
});
