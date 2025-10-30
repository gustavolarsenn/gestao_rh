import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Branch } from './entities/branch.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private readonly repo: Repository<Company>,
    @InjectRepository(Branch) private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    // Evita nomes duplicados globais (ajuste se quiser outra regra)
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Company already exists with this name.');
    const entity = this.repo.create(dto as Partial<Company>);
    await this.repo.save(entity);

    const branchExists = await this.branchRepo.findOne({ where: { cnpj: dto.cnpj } });
    if (branchExists) throw new ConflictException('Branch already exists with this CNPJ.');

    const branchEntity = this.branchRepo.create({
      name: 'Matriz',
      cnpj: dto.cnpj,
      zipCode: dto.zipCode,
      city: { id: dto.cityId! },
      address: dto.address,
      addressNumber: dto.addressNumber,
      companyId: entity.id
    } as Partial<Branch>);

    await this.branchRepo.save(branchEntity);

    return entity;
  }

  async findAll(): Promise<Company[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Company> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Company not found');
    return row;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const row = await this.findOne(id);
    if (dto.name && dto.name !== row.name) {
      const exists = await this.repo.findOne({ where: { name: dto.name } });
      if (exists) throw new ConflictException('Company name already in use.');
    }
    const merged = this.repo.merge(row, dto as Partial<Company>);
    return this.repo.save(merged);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}