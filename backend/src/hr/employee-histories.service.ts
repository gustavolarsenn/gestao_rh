import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeHistory } from './entities/employee-history.entity';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { UpdateEmployeeHistoryDto } from './dto/update-employee-history.dto';

@Injectable()
export class EmployeeHistoriesService {
  constructor(
    @InjectRepository(EmployeeHistory) private readonly repo: Repository<EmployeeHistory>,
  ) {}

  async create(dto: CreateEmployeeHistoryDto): Promise<EmployeeHistory> {
    const entity = this.repo.create(dto as Partial<EmployeeHistory>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, employeeId?: string): Promise<EmployeeHistory[]> {
    return this.repo.find({
      where: employeeId ? { companyId, employeeId } as any : { companyId } as any,
      order: { startDate: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<EmployeeHistory> {
    const hist = await this.repo.findOne({ where: { companyId, id } });
    if (!hist) throw new NotFoundException('Employee history not found');
    return hist;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeHistoryDto): Promise<EmployeeHistory> {
    const hist = await this.findOne(companyId, id);
    const merged = this.repo.merge(hist, dto as any);
    return this.repo.save(merged);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const hist = await this.findOne(companyId, id);
    await this.repo.remove(hist);
  }
}