import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: jest.Mocked<TeamsService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const mockEntity: any = { id, companyId, name: 'Plataforma' };

  const serviceMock: jest.Mocked<TeamsService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [{ provide: TeamsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(TeamsController);
    service = module.get(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Plataforma' } as any)).resolves.toEqual(mockEntity);
    expect(service.create).toHaveBeenCalled();
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
    service.update.mockResolvedValue({ ...mockEntity, name: 'Core' });
    await expect(controller.update(id, companyId, { companyId, name: 'Core' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Core' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});