import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  const mockUser = {
    id: userId,
    companyId,
    name: 'Alice',
    email: 'alice@acme.com',
    passwordHash: 'hash',
    isActive: true,
  };

  const serviceMock: jest.Mocked<UsersService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /users -> create', async () => {
    const dto: CreateUserDto = {
      companyId,
      name: 'Alice',
      email: 'alice@acme.com',
      password: 'Secret123!',
      isActive: true,
    };
    service.create.mockResolvedValue(mockUser as any);

    await expect(controller.create(dto)).resolves.toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('GET /users -> findAll', async () => {
    service.findAll.mockResolvedValue([mockUser] as any);

    await expect(controller.findAll(companyId)).resolves.toEqual([mockUser]);
    expect(service.findAll).toHaveBeenCalledWith(companyId);
  });

  it('GET /users/:id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockUser as any);

    await expect(controller.findOne(userId, companyId)).resolves.toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith(companyId, userId);
  });

  it('PATCH /users/:id -> update', async () => {
    const dto: UpdateUserDto = { name: 'Alice Updated', companyId } as any;
    service.update.mockResolvedValue({ ...mockUser, name: 'Alice Updated' } as any);

    await expect(controller.update(userId, companyId, dto)).resolves.toEqual({ ...mockUser, name: 'Alice Updated' });
    expect(service.update).toHaveBeenCalledWith(companyId, userId, dto);
  });

  it('DELETE /users/:id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);

    await expect(controller.remove(userId, companyId)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(companyId, userId);
  });
});