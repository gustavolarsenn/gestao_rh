// src/org/branches.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { applyScope } from '../common/utils/scoped-query.util';
import { branchQueryDto } from './dto/branch-query.dto';

@Injectable()
export class BranchesService {
  constructor(@InjectRepository(Branch) private readonly repo: Repository<Branch>) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const entity = this.repo.create(dto as Partial<Branch>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: branchQueryDto) {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });

    if (query.name) {
      where['name'] = ILike(`%${query.name}%`);
    }
    if (query.cnpj) {
      where['cnpj'] = ILike(`%${query.cnpj}%`);
    }
    if (query.cityId) {
      where['city'] = { id: query.cityId };
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });
    return { page, limit, total, data };
  }

  async findDistinctBranches(user: any): Promise<Branch[]> {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });
    
    return this.repo.find({ where });
  }

  async findOne(companyId: string, id: string): Promise<Branch> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Branch not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateBranchDto): Promise<Branch> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}