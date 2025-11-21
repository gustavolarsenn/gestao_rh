// src/org/departments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { applyScope } from '../common/utils/scoped-query.util';
import { DepartmentQueryDto } from './dto/department-query.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectRepository(Department) private readonly repo: Repository<Department>) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const entity = this.repo.create(dto as Partial<Department>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: DepartmentQueryDto) {
    const where = applyScope(user, {}, { company: true, team: false, employee: true, department: true }, 'department');
    
    if (query.name) {
      where['name'] = ILike(`%${query.name}%`);
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });
    return { page, limit, total, data };
  }

  async findDistinctDepartments(user: any): Promise<Department[]> {
    const where = applyScope(user, {}, { company: true, team: false, employee: true, department: true }, 'department');
    
    return this.repo.find({ where });
  }

  async findOne(companyId: string, id: string): Promise<Department> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Department not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}