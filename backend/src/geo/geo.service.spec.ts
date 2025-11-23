import { Test } from '@nestjs/testing';
import { GeoService } from './geo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('GeoService', () => {
  let service: GeoService;
  let statesRepo: jest.Mocked<Repository<State>>;
  let citiesRepo: jest.Mocked<Repository<City>>;

  function mockRepo() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((e) => e),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
      save: jest.fn((e) => Promise.resolve(e)),
      remove: jest.fn(),
    } as any;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GeoService,
        { provide: getRepositoryToken(State), useValue: mockRepo() },
        { provide: getRepositoryToken(City), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(GeoService);
    statesRepo = module.get(getRepositoryToken(State));
    citiesRepo = module.get(getRepositoryToken(City));
  });

  // ======================
  // STATES
  // ======================

  it('createState deve criar quando não existe', async () => {
    statesRepo.findOne.mockResolvedValueOnce(null);
    statesRepo.save.mockResolvedValueOnce({ id: 's1' } as any);

    const result = await service.createState({ name: 'Pará', uf: 'PA' });

    expect(statesRepo.create).toHaveBeenCalled();
    expect(statesRepo.save).toHaveBeenCalled();
    expect(result.id).toBe('s1');
  });

  it('createState deve lançar erro se estado já existe', async () => {
    statesRepo.findOne.mockResolvedValueOnce({ id: 's1' } as any);

    await expect(
      service.createState({ name: 'Pará', uf: 'PA' }),
    ).rejects.toThrow(ConflictException);
  });

  it('findOneState deve retornar registro', async () => {
    statesRepo.findOne.mockResolvedValueOnce({ id: 's1' } as any);

    const result = await service.findOneState('s1');
    expect(result.id).toBe('s1');
  });

  it('findOneState deve lançar NotFound', async () => {
    statesRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.findOneState('x')).rejects.toThrow(NotFoundException);
  });

  it('updateState deve atualizar', async () => {
    statesRepo.findOne.mockResolvedValueOnce({ id: 's1', name: 'A' } as any);
    statesRepo.findOne.mockResolvedValueOnce(null);

    const result = await service.updateState('s1', { name: 'B' });

    expect(statesRepo.merge).toHaveBeenCalled();
    expect(statesRepo.save).toHaveBeenCalled();
    expect(result.name).toBe('B');
  });

  // ======================
  // CITIES
  // ======================

  it('createCity deve criar quando válido', async () => {
    statesRepo.findOne.mockResolvedValueOnce({ id: 'pa' } as any);
    citiesRepo.findOne.mockResolvedValueOnce(null);
    citiesRepo.save.mockResolvedValueOnce({ id: 'c1' } as any);

    const result = await service.createCity({
      name: 'Santarém',
      stateId: 'pa',
    });

    expect(citiesRepo.create).toHaveBeenCalled();
    expect(result.id).toBe('c1');
  });

  it('createCity deve lançar erro se estado não existe', async () => {
    statesRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.createCity({ name: 'Test', stateId: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('findOneCity deve retornar cidade', async () => {
    citiesRepo.findOne.mockResolvedValueOnce({ id: 'c1' } as any);

    const result = await service.findOneCity('c1');
    expect(result.id).toBe('c1');
  });

  it('findOneCity deve lançar erro se cidade não existe', async () => {
    citiesRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.findOneCity('x')).rejects.toThrow(NotFoundException);
  });

  it('removeCity deve remover', async () => {
    citiesRepo.findOne.mockResolvedValueOnce({ id: 'c1' } as any);
    citiesRepo.remove.mockResolvedValueOnce(undefined as any);

    await service.removeCity('c1');
    expect(citiesRepo.remove).toHaveBeenCalled();
  });
});
