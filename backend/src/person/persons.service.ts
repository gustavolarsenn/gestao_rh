import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonQueryDto } from './dto/person-query.dto';
import { applyScope } from '../common/utils/scoped-query.util';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(Person) private readonly repo: Repository<Person>,
  ) {}

  async create(dto: CreatePersonDto): Promise<Person> {
    if (dto.cpf) {
      const exists = await this.repo.findOne({ where: { companyId: dto.companyId, cpf: dto.cpf } });
      if (exists) throw new ConflictException('Person with this CPF already exists in this company.');
    }

    const entity = this.repo.create(dto as Partial<Person>);
    return this.repo.save(entity);
  }

  async findAll(user: any, query: PersonQueryDto) {
    if (user.level < 3) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    const where = applyScope(user, {}, { company: true, team: false, employee: false, department: false });

    if (query.cityId) {
      where['cityId'] = query.cityId;
    }
    if (query.cpf) {
      where['cpf'] = Like(`%${query.cpf}%`);
    }
    if (query.name) {
      where['name'] = ILike(`%${query.name}%`);
    }
    if (query.email) {
      where['email'] = ILike(`%${query.email}%`);
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, skip, take: limit });

    return { page, limit, total, data };
  }

  async findOne(companyId: string, id: string): Promise<Person> {
    const person = await this.repo.findOne({ where: { companyId, id } });
    if (!person) throw new NotFoundException('Employee not found');
    return person;
  }

  async update(companyId: string, id: string, dto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(companyId, id);

    if (dto.cpf && dto.cpf !== person.cpf) {
      const exists = await this.repo.findOne({ where: { companyId, cpf: dto.cpf } });
      if (exists) throw new ConflictException('Person with this CPF already exists in this company.');
    }

    const merged = this.repo.merge(person, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const person = await this.findOne(companyId, id);
    await this.repo.remove(person);
  }
}