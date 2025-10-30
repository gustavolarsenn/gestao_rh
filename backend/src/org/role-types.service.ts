// src/org/role-types.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleType } from './entities/role-type.entity';
import { CreateRoleTypeDto } from './dto/create-role-type.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';

@Injectable()
export class RoleTypesService {
  constructor(@InjectRepository(RoleType) private readonly repo: Repository<RoleType>) {}

  async create(dto: CreateRoleTypeDto): Promise<RoleType> {
    const entity = this.repo.create(dto as Partial<RoleType>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<RoleType[]> {
    return this.repo.find({ where: { companyId }, relations: ['department'] });
  }

  async findOne(companyId: string, id: string): Promise<RoleType> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('Role type not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateRoleTypeDto): Promise<RoleType> {
    const row = await this.findOne(companyId, id);
    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}