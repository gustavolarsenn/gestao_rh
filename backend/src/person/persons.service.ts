import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

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

  async findAll(companyId: string): Promise<Person[]> {
    return this.repo.find({ where: { companyId } });
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