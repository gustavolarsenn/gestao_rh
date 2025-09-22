import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

  const mockEntity: any = { id, companyId, name: 'Engenheiro' };

  const serviceMock: jest.Mocked<RolesService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(RolesController);
    service = module.get(RolesService);
  });

  it('POST', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Engenheiro' } as any))
      .resolves.toEqual(mockEntity);
  });

  it('GET', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId)).resolves.toEqual([mockEntity]);
  });

  it('GET :id', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id', async () => {
    service.update.mockResolvedValue({ ...mockEntity, name: 'SRE' });
    await expect(controller.update(id, companyId, { companyId, name: 'SRE' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'SRE' });
  });

  it('DELETE :id', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});