import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationType } from './entities/evaluation-type.entity';
import { CreateEvaluationTypeDto } from './dto/create-evaluation-type.dto';
import { UpdateEvaluationTypeDto } from './dto/update-evaluation-type.dto';

@Injectable()
export class EvaluationTypesService {
  constructor(
    @InjectRepository(EvaluationType) private readonly repo: Repository<EvaluationType>,
  ) {}

  async create(dto: CreateEvaluationTypeDto): Promise<EvaluationType> {
    // Opcional: unicidade por (companyId, name)
    const exists = await this.repo.findOne({ where: { companyId: dto.companyId, name: dto.name } });
    if (exists) throw new ConflictException('Evaluation type already exists for this company.');

    const entity = this.repo.create(dto as Partial<EvaluationType>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<EvaluationType[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findOne(companyId: string, id: string): Promise<EvaluationType> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Evaluation type not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateEvaluationTypeDto): Promise<EvaluationType> {
    const row = await this.findOne(companyId, id);

    if (dto.name && dto.name !== row.name) {
      const nameExists = await this.repo.findOne({ where: { companyId, name: dto.name } });
      if (nameExists) throw new ConflictException('Another evaluation type with this name already exists.');
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}