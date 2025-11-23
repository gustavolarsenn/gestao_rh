// src/auth/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRolesService {
  constructor(@InjectRepository(UserRole) private readonly repo: Repository<UserRole>) {}

  async create(dto: CreateUserRoleDto): Promise<UserRole> {
    const entity = this.repo.create(dto as Partial<UserRole>);
    return this.repo.save(entity);
  }

  async findAll(): Promise<UserRole[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<UserRole> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('UserRole not found');
    return row;
  }
  
  async update(id: string, dto: UpdateUserRoleDto): Promise<UserRole> {
    const role = await this.findOne(id);
    const merged = this.repo.merge(role, {
      name: dto.name ?? role.name,
    } as Partial<UserRole>);
    return this.repo.save(merged);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.repo.remove(role);
  }
}
