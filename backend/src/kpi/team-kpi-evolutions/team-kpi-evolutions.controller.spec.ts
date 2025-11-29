import { Test, TestingModule } from '@nestjs/testing';
import { TeamKpiEvolutionsController } from './team-kpi-evolutions.controller';
import { TeamKpiEvolutionsService } from './team-kpi-evolutions.service';

describe('TeamKpiEvolutionsController', () => {
  let controller: TeamKpiEvolutionsController;
  let service: jest.Mocked<TeamKpiEvolutionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamKpiEvolutionsController],
      providers: [
        {
          provide: TeamKpiEvolutionsService,
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

    controller = module.get(TeamKpiEvolutionsController);
    service = module.get(TeamKpiEvolutionsService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST create', async () => {
    const dto = { teamId: 't1' } as any;
    service.create.mockResolvedValue(dto);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  it('GET findAll', async () => {
    const req = { user: { companyId: 'c1' } } as any;
    const query: any = {};

    service.findAll.mockResolvedValue([{ id: 'ev1' }] as any);

    const result = await controller.findAll(req, query);

    expect(service.findAll).toHaveBeenCalledWith(req.user, query);
    expect(result).toEqual([{ id: 'ev1' }]);
  });

  it('GET findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'ev1' } as any);

    const result = await controller.findOne('ev1', 'c1');

    expect(service.findOne).toHaveBeenCalledWith('c1', 'ev1');
    expect(result).toEqual({ id: 'ev1' });
  });

  it('PATCH update', async () => {
    const dto = { teamId: 't2' } as any;
    service.update.mockResolvedValue({ id: 'ev1' } as any);

    const result = await controller.update('ev1', 'c1', dto);

    expect(service.update).toHaveBeenCalledWith('c1', 'ev1', dto);
    expect(result).toEqual({ id: 'ev1' });
  });

  it('POST approve', async () => {
    service.approve.mockResolvedValue({ id: 'ev1' } as any);

    const result = await controller.approve('ev1', 'c1', 'u1');

    expect(service.approve).toHaveBeenCalledWith('c1', 'ev1', 'u1');
    expect(result).toEqual({ id: 'ev1' });
  });

  it('POST reject', async () => {
    service.reject.mockResolvedValue({ id: 'ev1' } as any);

    const result = await controller.reject('ev1', 'c1', 'u1', 'motivo');

    expect(service.reject).toHaveBeenCalledWith('c1', 'ev1', 'u1', 'motivo');
    expect(result).toEqual({ id: 'ev1' });
  });

  it('DELETE remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('ev1', 'c1');

    expect(service.remove).toHaveBeenCalledWith('c1', 'ev1');
  });
});
