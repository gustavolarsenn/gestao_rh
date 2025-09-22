import { Test, TestingModule } from '@nestjs/testing';
import { KpisController } from './kpis.controller';
import { KpisService } from './kpis.service';

describe('KpisController', () => {
  let controller: KpisController;
  let service: jest.Mocked<KpisService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const mockEntity: any = {
    id,
    companyId,
    name: 'Bugs Corrigidos',
    evaluationTypeId: 'et-1',
    active: true,
  };

  const serviceMock: jest.Mocked<KpisService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpisController],
      providers: [{ provide: KpisService, useValue: serviceMock }],
    }).compile();

    controller = module.get(KpisController);
    service = module.get(KpisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId, name: 'Bugs Corrigidos', evaluationTypeId: 'et-1', active: true,
    } as any)).resolves.toEqual(mockEntity);
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
    service.update.mockResolvedValue({ ...mockEntity, name: 'Novo Nome' });
    await expect(controller.update(id, companyId, { companyId, name: 'Novo Nome' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Novo Nome' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});