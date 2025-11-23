import { Test, TestingModule } from '@nestjs/testing';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

describe('GeoController', () => {
  let controller: GeoController;
  let service: jest.Mocked<GeoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [
        {
          provide: GeoService,
          useValue: {
            createState: jest.fn(),
            findAllStates: jest.fn(),
            findOneState: jest.fn(),
            updateState: jest.fn(),
            removeState: jest.fn(),

            createCity: jest.fn(),
            findAllCities: jest.fn(),
            findOneCity: jest.fn(),
            updateCity: jest.fn(),
            removeCity: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(GeoController);
    service = module.get(GeoService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  // ===== STATES =====

  it('POST createState', async () => {
    const dto = { name: 'Pará', uf: 'PA' } as any;
    service.createState.mockResolvedValue(dto);

    const result = await controller.createState(dto);

    expect(service.createState).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  it('GET listStates', async () => {
    service.findAllStates.mockResolvedValue([{ id: 's1' }] as any);

    const result = await controller.listStates();

    expect(service.findAllStates).toHaveBeenCalled();
    expect(result).toEqual([{ id: 's1' }]);
  });

  it('GET getState', async () => {
    service.findOneState.mockResolvedValue({ id: 's1' } as any);

    const result = await controller.getState('s1');

    expect(service.findOneState).toHaveBeenCalledWith('s1');
    expect(result).toEqual({ id: 's1' });
  });

  it('PATCH updateState', async () => {
    const dto = { name: 'Novo' } as any;
    service.updateState.mockResolvedValue({ id: 's1' } as any);

    const result = await controller.updateState('s1', dto);

    expect(service.updateState).toHaveBeenCalledWith('s1', dto);
    expect(result).toEqual({ id: 's1' });
  });

  it('DELETE deleteState', async () => {
    service.removeState.mockResolvedValue(undefined);

    await controller.deleteState('s1');

    expect(service.removeState).toHaveBeenCalledWith('s1');
  });

  // ===== CITIES =====

  it('POST createCity', async () => {
    const dto = { name: 'Santarém', stateId: 'pa-123' } as any;
    service.createCity.mockResolvedValue(dto);

    const result = await controller.createCity(dto);

    expect(service.createCity).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });

  it('GET listCities', async () => {
    service.findAllCities.mockResolvedValue([{ id: 'c1' }] as any);

    const result = await controller.listCities('pa-123');

    expect(service.findAllCities).toHaveBeenCalledWith('pa-123');
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('GET getCity', async () => {
    service.findOneCity.mockResolvedValue({ id: 'c1' } as any);

    const result = await controller.getCity('c1');

    expect(service.findOneCity).toHaveBeenCalledWith('c1');
    expect(result).toEqual({ id: 'c1' });
  });

  it('PATCH updateCity', async () => {
    const dto = { name: 'Novo Nome' } as any;
    service.updateCity.mockResolvedValue({ id: 'c1' } as any);

    const result = await controller.updateCity('c1', dto);

    expect(service.updateCity).toHaveBeenCalledWith('c1', dto);
    expect(result).toEqual({ id: 'c1' });
  });

  it('DELETE deleteCity', async () => {
    service.removeCity.mockResolvedValue(undefined);

    await controller.deleteCity('c1');

    expect(service.removeCity).toHaveBeenCalledWith('c1');
  });
});
