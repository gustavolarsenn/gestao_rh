import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsController } from './career-paths.controller';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsController', () => {
  let controller: CareerPathsController;
  let service: jest.Mocked<CareerPathsService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = '44444444-4444-4444-4444-444444444444';

  const mockEntity: any = {
    id,
    companyId,
    name: 'Trilha',
  };

  const serviceMock: jest.Mocked<CareerPathsService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerPathsController],
      providers: [{ provide: CareerPathsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(CareerPathsController);
    service = module.get(CareerPathsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Trilha' } as any)).resolves.toEqual(mockEntity);
  });

  it('GET -> findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId)).resolves.toEqual([mockEntity]);
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, name: 'Nova' });
    await expect(controller.update(id, companyId, { companyId, name: 'Nova' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Nova' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});