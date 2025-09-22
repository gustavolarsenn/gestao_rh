// src/org/departments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectRepository(Department) private readonly repo: Repository<Department>) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const entity = this.repo.create(dto as Partial<Department>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<Department[]> {
    return this.repo.find({ where: { companyId } });
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