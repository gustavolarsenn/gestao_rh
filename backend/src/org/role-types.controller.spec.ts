import { Test, TestingModule } from '@nestjs/testing';
import { RoleTypesController } from './role-types.controller';
import { RoleTypesService } from './role-types.service';

describe('RoleTypesController', () => {
  let controller: RoleTypesController;
  let service: jest.Mocked<RoleTypesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  const mockEntity: any = { id, companyId, name: 'CLT' };

  const serviceMock: jest.Mocked<RoleTypesService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleTypesController],
      providers: [{ provide: RoleTypesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(RoleTypesController);
    service = module.get(RoleTypesService);
  });

  it('POST', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'CLT' } as any))
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
    service.update.mockResolvedValue({ ...mockEntity, name: 'PJ' });
    await expect(controller.update(id, companyId, { companyId, name: 'PJ' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'PJ' });
  });

  it('DELETE :id', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});