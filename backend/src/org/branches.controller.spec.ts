import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

describe('BranchesController', () => {
  let controller: BranchesController;
  let service: jest.Mocked<BranchesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const mockEntity: any = { id, companyId, name: 'Filial SP' };

  const serviceMock: jest.Mocked<BranchesService> = {
    create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
    update: jest.fn(), remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [{ provide: BranchesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(BranchesController);
    service = module.get(BranchesService);
  });

  it('POST', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Filial SP' } as any))
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
    service.update.mockResolvedValue({ ...mockEntity, name: 'Filial RJ' });
    await expect(controller.update(id, companyId, { companyId, name: 'Filial RJ' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Filial RJ' });
  });

  it('DELETE :id', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});