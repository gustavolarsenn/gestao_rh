// src/org/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { applyScope } from '../common/utils/scoped-query.util';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const entity = this.repo.create(dto as Partial<Role>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: RoleQueryDto) {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });
    
    if (query.name) {
      where['name'] = ILike(`%${query.name}%`);
    }
    if (query.roleTypeId) {
      where['roleTypeId'] = query.roleTypeId;
    }
    if (query.departmentId) {
      where['departmentId'] = query.departmentId;
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });
    return { page, limit, total, data };
  }

  async findDistinctRoles(user: any) {
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: true });
    return await this.repo.find({ where });
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