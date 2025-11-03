import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/create-employee-kpi-evolution.dto';
import { UpdateEmployeeKpiEvolutionDto } from '../dto/employee-kpi-evolution/update-employee-kpi-evolution.dto';
import { KpiStatus } from '../entities/kpi.enums';
import { EmployeeKPIEvolution } from '../entities/employee-kpi-evolution.entity';

@Injectable()
export class EmployeeKpiEvolutionsService {
  constructor(@InjectRepository(EmployeeKPIEvolution) private readonly repo: Repository<EmployeeKPIEvolution>) {}

  async create(dto: CreateEmployeeKpiEvolutionDto, req: any): Promise<EmployeeKPIEvolution> {
    const user = req.user;

    console.log('Creating EmployeeKPIEvolution for user:', user);
    const exists = await this.repo.findOne({
      where: {
        companyId: user.companyId,
        employeeId: user.employeeId,
        employeeKpiId: dto.employeeKpiId,
        submittedDate: new Date(),
        submittedBy: user.id,
      } as any,
    });
    if (exists) throw new ConflictException('An EmployeeKPIEvolution for this period already exists.');

    const entity = this.repo.create({
      companyId: user.companyId,
      employeeId: user.employeeId,
      submittedBy: user.id,
      submittedDate: new Date(),
       ...dto
      } as Partial<EmployeeKPIEvolution>);
    return this.repo.save(entity);
  }

  async findAll(companyId: string, filters?: {
    employeeId?: string;
    employeeKpiId?: string;
    submittedDate?: Date;
    status?: KpiStatus;
  }): Promise<EmployeeKPIEvolution[]> {
    const where: any = { companyId };

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.employeeKpiId) where.employeeKpiId = filters.employeeKpiId;
    if (filters?.status) where.status = filters.status;

    return this.repo.find({ where, relations: ['employee', 'employee.person', 'employeeKpi'] });
  }

  async findOne(companyId: string, id: string): Promise<EmployeeKPIEvolution> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['employee', 'employee.person', 'employeeKpi'] });
    if (!row) throw new NotFoundException('EmployeeKPI not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeKpiEvolutionDto): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);

    // se mudar chaves da unique, checar duplicidade
    const keysChange =
      // (dto.employeeId && dto.employeeId !== row.employeeId) ||
      (dto.employeeKpiId && dto.employeeKpiId !== row.employeeKpiId) ||
      (dto.submittedDate && dto.submittedDate !== row.submittedDate)

    if (keysChange) {
      const dup = await this.repo.findOne({
        where: {
          // companyId: dto.companyId ?? row.companyId,
          // employeeId: dto.employeeId ?? row.employeeId,
          employeeKpiId: dto.employeeKpiId ?? row.employeeKpiId,
          submittedDate: dto.submittedDate ?? row.submittedDate,
        } as any,
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Another EmployeeKPI exists with the same unique keys.');
      }
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async approve(companyId: string, id: string, approverUserId: string): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.APPROVED) return row;
    if (row.status === KpiStatus.REJECTED) throw new BadRequestException('Cannot approve a rejected KPI.');

    row.status = KpiStatus.APPROVED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    return this.repo.save(row);
  }

  async reject(companyId: string, id: string, approverUserId: string, reason?: string): Promise<EmployeeKPIEvolution> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.REJECTED) return row;
    if (row.status === KpiStatus.APPROVED) throw new BadRequestException('Cannot reject an approved KPI.');

    row.status = KpiStatus.REJECTED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    row.rejectionReason = reason ?? null;
    return this.repo.save(row);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const row = await this.findOne(companyId, id);
    await this.repo.remove(row);
  }
}