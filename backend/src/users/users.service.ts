// src/auth/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async findByEmail(companyId: string, email: string): Promise<User | null> {
    return this.repo.findOne({ where: { companyId, email } });
  }

  async findAnyByEmail(email: string): Promise<User[]> {
    return this.repo.find({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.findByEmail(dto.companyId, dto.email);
    if (exists) throw new ConflictException('Email already in use for this company');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const entity = this.repo.create({
      companyId: dto.companyId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      birthDate: dto.birthDate ?? null,
      isActive: true,
    } as Partial<User>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<User[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findOne(companyId: string, id: string): Promise<User> {
    const row = await this.repo.findOne({ where: { companyId, id } });
    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateUserDto): Promise<User> {
    const row = await this.findOne(companyId, id);

    if (dto.email && dto.email !== row.email) {
      const exists = await this.findByEmail(companyId, dto.email);
      if (exists) throw new ConflictException('Email already in use for this company');
    }

    let passwordHash = row.passwordHash;
    if ((dto as any).password) {
      passwordHash = await bcrypt.hash((dto as any).password, 10);
    }

    const merged = this.repo.merge(row, {
      name: dto.name ?? row.name,
      email: dto.email ?? row.email,
      birthDate: dto.birthDate ?? row.birthDate,
      isActive: dto.isActive ?? row.active,
      passwordHash,
    } as Partial<User>);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}
