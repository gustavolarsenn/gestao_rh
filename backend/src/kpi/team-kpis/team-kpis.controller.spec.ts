import { Test, TestingModule } from '@nestjs/testing';
import { TeamKpisController } from './team-kpis.controller';
import { TeamKpisService } from './team-kpis.service';
import { KpiStatus } from '../entities/kpi.enums';

describe('TeamKpisController', () => {
  let controller: TeamKpisController;
  let service: jest.Mocked<TeamKpisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamKpisController],
      providers: [
        {
          provide: TeamKpisService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            approve: jest.fn(),
            reject: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TeamKpisController);
    service = module.get(TeamKpisService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // CREATE
  it('POST create', async () => {
    const dto = { teamId: 't1' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  // FIND ALL
  it('GET findAll', async () => {
    const req: any = { user: { id: 'u1', companyId: 'c1' } };
    const query: any = {};

    service.findAll.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await controller.findAll(query, req);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });
  });

  // FIND ONE
  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'tk1' } as any);

    const result = await controller.findOne('tk1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'tk1');
    expect(result).toEqual({ id: 'tk1' });
  });

  // UPDATE
  it('PATCH update', async () => {
    const dto = { goal: '20' } as any;
    service.update.mockResolvedValue({ id: 'tk1' } as any);

    const result = await controller.update('tk1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'tk1', dto);
    expect(result).toEqual({ id: 'tk1' });
  });

  // APPROVE
  it('POST approve', async () => {
    service.approve.mockResolvedValue({ id: 'tk1', status: KpiStatus.APPROVED } as any);

    const result = await controller.approve('tk1', 'c1', 'u1');

    expect(service.approve).toHaveBeenCalledWith('c1', 'tk1', 'u1');
    expect(result).toEqual({ id: 'tk1', status: KpiStatus.APPROVED });
  });

  // REJECT
  it('POST reject', async () => {
    service.reject.mockResolvedValue({ id: 'tk1', status: KpiStatus.REJECTED } as any);

    const result = await controller.reject('tk1', 'c1', 'u1', 'Bad');

    expect(service.reject).toHaveBeenCalledWith('c1', 'tk1', 'u1', 'Bad');
    expect(result).toEqual({ id: 'tk1', status: KpiStatus.REJECTED });
  });

  // REMOVE
  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('tk1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'tk1');
  });
});
