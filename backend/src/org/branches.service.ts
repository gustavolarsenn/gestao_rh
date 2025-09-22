// src/org/branches.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(@InjectRepository(Branch) private readonly repo: Repository<Branch>) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const entity = this.repo.create(dto as Partial<Branch>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<Branch[]> {
    return this.repo.find({ where: { companyId } });
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