import { Test, TestingModule } from '@nestjs/testing';
import { TeamKpisController } from './team-kpis.controller';
import { TeamKpisService } from './team-kpis.service';
import { KpiSource } from './entities/kpi.enums';

describe('TeamKpisController', () => {
  let controller: TeamKpisController;
  let service: jest.Mocked<TeamKpisService>;

  const companyId = '11111111-1111-1111-1111-111111111111';
  const id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

  const mockEntity: any = {
    id,
    companyId,
    teamId: 'team-1',
    kpiId: 'kpi-1',
    periodStart: '2025-09-01',
    periodEnd: '2025-09-30',
  };

  const serviceMock: jest.Mocked<TeamKpisService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    Object.values(serviceMock).forEach((fn) => (fn as any).mockReset?.());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamKpisController],
      providers: [{ provide: TeamKpisService, useValue: serviceMock }],
    }).compile();

    controller = module.get(TeamKpisController);
    service = module.get(TeamKpisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST -> create', async () => {
    service.create.mockResolvedValue(mockEntity);
    await expect(controller.create({
      companyId, teamId: 'team-1', kpiId: 'kpi-1', evaluationTypeId: 'et-1',
      periodStart: '2025-09-01', periodEnd: '2025-09-30', source: KpiSource.MANAGER, submittedBy: 'user-1',
    } as any)).resolves.toEqual(mockEntity);
  });

  it('GET -> findAll', async () => {
    service.findAll.mockResolvedValue([mockEntity]);
    await expect(controller.findAll(companyId, undefined, undefined, undefined))
      .resolves.toEqual([mockEntity]);
  });

  it('GET :id -> findOne', async () => {
    service.findOne.mockResolvedValue(mockEntity);
    await expect(controller.findOne(id, companyId)).resolves.toEqual(mockEntity);
  });

  it('PATCH :id -> update', async () => {
    service.update.mockResolvedValue({ ...mockEntity, achievedValue: '120' });
    await expect(controller.update(id, companyId, { companyId, achievedValue: '120' } as any))
      .resolves.toEqual({ ...mockEntity, achievedValue: '120' });
  });

  it('DELETE :id -> remove', async () => {
    service.remove.mockResolvedValue(undefined as any);
    await expect(controller.remove(id, companyId)).resolves.toBeUndefined();
  });
});