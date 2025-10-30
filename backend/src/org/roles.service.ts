// src/org/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const entity = this.repo.create(dto as Partial<Role>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<Role[]> {
    return this.repo.find({ where: { companyId }, relations: ['roleType', 'department'] });
  }

  async findOne(companyId: string, id: string): Promise<Role> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Role not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateRoleDto): Promise<Role> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}