import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(State) private readonly statesRepo: Repository<State>,
    @InjectRepository(City) private readonly citiesRepo: Repository<City>,
  ) {}

  // ===== States =====
  async createState(dto: CreateStateDto): Promise<State> {
    const exists = await this.statesRepo.findOne({ where: { name: dto.name, uf: dto.uf } });
    if (exists) throw new ConflictException('State already exists');
    const entity = this.statesRepo.create({ name: dto.name, uf: dto.uf });
    return this.statesRepo.save(entity);
  }

  findAllStates(): Promise<State[]> {
    return this.statesRepo.find({ order: { name: 'ASC' } });
  }

  async findOneState(id: string): Promise<State> {
    const row = await this.statesRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('State not found');
    return row;
  }

  async updateState(id: string, dto: UpdateStateDto): Promise<State> {
    const row = await this.findOneState(id);
    if (dto.name && dto.name !== row.name) {
      const dupe = await this.statesRepo.findOne({ where: { name: dto.name } });
      if (dupe) throw new ConflictException('State already exists');
    }
    const merged = this.statesRepo.merge(row, dto);
    return this.statesRepo.save(merged);
  }

  async removeState(id: string): Promise<void> {
    const row = await this.findOneState(id);
    await this.statesRepo.remove(row);
  }

  // ===== Cities =====
  async createCity(dto: CreateCityDto): Promise<City> {
    // valida FK
    const state = await this.statesRepo.findOne({ where: { id: dto.stateId } });
    if (!state) throw new NotFoundException('State not found');

    const exists = await this.citiesRepo.findOne({
      where: { name: dto.name, stateId: dto.stateId },
    });
    if (exists) throw new ConflictException('City already exists in this state');

    const entity = this.citiesRepo.create({ name: dto.name, stateId: dto.stateId, state });
    return this.citiesRepo.save(entity);
  }

  findAllCities(stateId?: string): Promise<City[]> {
    return this.citiesRepo.find({
      where: stateId ? { stateId } : {},
      relations: { state: true },
      order: { name: 'ASC' },
    });
  }

  async findOneCity(id: string): Promise<City> {
    const row = await this.citiesRepo.findOne({ where: { id }, relations: { state: true } });
    if (!row) throw new NotFoundException('City not found');
    return row;
  }

  async updateCity(id: string, dto: UpdateCityDto): Promise<City> {
    const row = await this.findOneCity(id);

    if (dto.stateId && dto.stateId !== row.stateId) {
      const state = await this.statesRepo.findOne({ where: { id: dto.stateId } });
      if (!state) throw new NotFoundException('State not found');
      row.stateId = state.id;
      row.state = state;
    }
    if (dto.name && dto.name !== row.name) {
      const dupe = await this.citiesRepo.findOne({
        where: { name: dto.name, stateId: row.stateId },
      });
      if (dupe) throw new ConflictException('City already exists in this state');
    }

    const merged = this.citiesRepo.merge(row, { name: dto.name ?? row.name });
    return this.citiesRepo.save(merged);
  }

  async removeCity(id: string): Promise<void> {
    const row = await this.findOneCity(id);
    await this.citiesRepo.remove(row);
  }
}