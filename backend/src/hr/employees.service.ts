import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    if (dto.userId) {
      const exists = await this.repo.findOne({ where: { companyId: dto.companyId, userId: dto.userId } });
      if (exists) throw new ConflictException('Employee for this user already exists in this company.');
    }

    const entity = this.repo.create(dto as Partial<Employee>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string): Promise<Employee[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findOne(companyId: string, id: string): Promise<Employee> {
    const emp = await this.repo.findOne({ where: { companyId, id } });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const emp = await this.findOne(companyId, id);

    if (dto.userId && dto.userId !== emp.userId) {
      const exists = await this.repo.findOne({ where: { companyId, userId: dto.userId } });
      if (exists) throw new ConflictException('Employee for this user already exists in this company.');
    }

    const merged = this.repo.merge(emp, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const emp = await this.findOne(companyId, id);
    await this.repo.remove(emp);
  }
}