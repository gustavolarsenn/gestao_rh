// src/auth/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Person } from '../person/entities/person.entity';
import { applyScope } from '../common/utils/scoped-query.util';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Person) private readonly personRepo: Repository<Person>,
  ) {}

  async findByEmail(companyId: string, email: string): Promise<User | null> {
    return this.repo.findOne({ where: { companyId, email } });
  }

  async findAnyByEmail(email: string): Promise<User[]> {
    return this.repo.find({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.findByEmail(dto.companyId, dto.email!);
    if (exists) throw new ConflictException('Email already in use for this company');
    
    const person = await this.personRepo.findOne({ where: { id: dto.personId } });
    if (!person) throw new NotFoundException('Person not found');


    const passwordHash = await bcrypt.hash(dto.password, 10);
    const entity = this.repo.create({
      companyId: dto.companyId,
      name: dto.name,
      email: person.email,
      passwordHash,
      person: { id: dto.personId },
      role: { id: dto.userRoleId },
    } as Partial<User>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: UserQueryDto){
    if (user.level < 3) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }
    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: false });
    
    if (query.cityId) {
      where['person'] = { cityId: query.cityId };
    }
    if (query.name) {
      where['person'] = { name: Like(`%${query.name}%`) };
    }
    if (query.email) {
      where['person'] = { email: Like(`%${query.email}%`) };
    }
    if (query.roleId) {
      where['roleId'] = query.roleId;
    }
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });

    return { page, limit, total, data };
  }

  async findOne(companyId: string, id: string): Promise<User> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['role', 'person'] });
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
      role: { id: dto.userRoleId ?? row.userRoleId },
      passwordHash,
    } as Partial<User>);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}
