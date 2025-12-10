import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { KPI } from './entities/kpi.entity';
import { CreateKpiDto } from './dto/kpi/create-kpi.dto';
import { UpdateKpiDto } from './dto/kpi/update-kpi.dto';
import { applyScope } from '../common/utils/scoped-query.util';
import { KPIQueryDto } from './dto/kpi/kpi-query.dto';

@Injectable()
export class KpisService {
  constructor(@InjectRepository(KPI) private readonly repo: Repository<KPI>) {}

  async create(dto: CreateKpiDto): Promise<KPI> {
    // Opcional: unicidade por (companyId, name)
    const exists = await this.repo.findOne({ where: { companyId: dto.companyId, name: dto.name } });
    if (exists) throw new ConflictException('KPI with this name already exists for this company.');

    const entity = this.repo.create(dto as Partial<KPI>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: KPIQueryDto) {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });
    
    if (query.evaluationTypeId) {
      where['evaluationTypeId'] = query.evaluationTypeId;
    }
    if (query.name) {
      where['name'] = ILike(`%${query.name}%`);
    }
    if (query.departmentId) {
      where['departmentId'] = query.departmentId;
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['evaluationType'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findDistinctKpis(user: any) {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });
    return await this.repo.find({ where });
  }

  async findOne(companyId: string, id: string): Promise<KPI> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('KPI not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateKpiDto): Promise<KPI> {
    const row = await this.findOne(companyId, id);

    if (dto.name && dto.name !== row.name) {
      const nameExists = await this.repo.findOne({ where: { companyId, name: dto.name } });
      if (nameExists) throw new ConflictException('Another KPI with this name already exists.');
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}