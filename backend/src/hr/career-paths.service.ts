import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerPath } from './entities/career-path.entity';
import { CreateCareerPathDto } from './dto/create-career-path.dto';
import { UpdateCareerPathDto } from './dto/update-career-path.dto';

@Injectable()
export class CareerPathsService {
  constructor(
    @InjectRepository(CareerPath) private readonly repo: Repository<CareerPath>,
  ) {}

  async create(dto: CreateCareerPathDto): Promise<CareerPath> {
    const entity = this.repo.create(dto as Partial<CareerPath>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<CareerPath[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findOne(companyId: string, id: string): Promise<CareerPath> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Career path not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateCareerPathDto): Promise<CareerPath> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}