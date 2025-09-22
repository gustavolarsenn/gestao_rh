import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationTypesController } from './evaluation-types.controller';
import { EvaluationTypesService } from './evaluation-types.service';
import { EvaluationCode } from './entities/evaluation-type.entity';

describe('EvaluationTypesController', () => {
  let controller: EvaluationTypesController;
  let service: jest.Mocked<EvaluationTypesService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const mockEntity: any = {
    id,
    companyId,
    name: 'Maior melhor',
    code: EvaluationCode.HIGHER_BETTER,
  };

  const serviceMock: jest.Mocked<EvaluationTypesService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationTypesController],
      providers: [{ provide: EvaluationTypesService, useValue: serviceMock }],
    }).compile();

    controller = module.get(EvaluationTypesController);
    service = module.get(EvaluationTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({ companyId, name: 'Maior melhor', code: EvaluationCode.HIGHER_BETTER } as any))
      .resolves.toEqual(mockEntity);
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
    service.update.mockResolvedValue({ ...mockEntity, name: 'Menor melhor' });
    await expect(controller.update(id, companyId, { companyId, name: 'Menor melhor' } as any))
      .resolves.toEqual({ ...mockEntity, name: 'Menor melhor' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});