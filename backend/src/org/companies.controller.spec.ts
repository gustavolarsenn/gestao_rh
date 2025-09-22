import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: jest.Mocked<CompaniesService>;

  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const mockEntity: any = { id, name: 'Acme Inc.' };

  const serviceMock: jest.Mocked<CompaniesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(CompaniesController);
    service = module.get(CompaniesService);
  });

  it('POST create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ name: 'Acme Inc.' } as any)).resolves.toEqual(mockEntity);
  });

  it('GET findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll()).resolves.toEqual([mockEntity]);
  });

  it('GET :id findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, name: 'Acme LLC' });
    await expect(controller.update(id, { name: 'Acme LLC' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Acme LLC' });
  });

  it('DELETE :id remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id)).resolves.toBeUndefined();
  });
});