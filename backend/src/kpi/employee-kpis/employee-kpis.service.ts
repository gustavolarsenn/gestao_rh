import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EmployeeKPI } from '../entities/employee-kpi.entity';
import { CreateEmployeeKpiDto } from '../dto/employee-kpi/create-employee-kpi.dto';
import { UpdateEmployeeKpiDto } from '../dto/employee-kpi/update-employee-kpi.dto';
import { EmployeeKPIQueryDto } from '../dto/employee-kpi/query-employee-kpi.dto';
import { KpiStatus } from '../entities/kpi.enums';
import { applyScope } from '../../common/utils/scoped-query.util';

@Injectable()
export class EmployeeKpisService {
  constructor(@InjectRepository(EmployeeKPI) private readonly repo: Repository<EmployeeKPI>) {}
  async create(dto: CreateEmployeeKpiDto): Promise<EmployeeKPI> {
    // Respeita a unique (companyId, employeeId, kpiId, periodStart, periodEnd, source) na entity
    const exists = await this.repo.findOne({
      where: {
        companyId: dto.companyId,
        employeeId: dto.employeeId,
        teamId: dto.teamId,
        kpiId: dto.kpiId,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
      } as any,
    });
    if (exists) throw new ConflictException('An EmployeeKPI for this period already exists.');

    const now = dto['submittedDate'] ? new Date(dto['submittedDate']) : new Date();
    const entity = this.repo.create({ ...(dto as Partial<EmployeeKPI>), submittedDate: now, status: KpiStatus.SUBMITTED });
    return this.repo.save(entity);
  }

  async findAll(user: any, query: EmployeeKPIQueryDto) {
    const where = applyScope(user, {}, { company: true, team: true, employee: true, department: false });

    if (query.kpiId) where.kpiId = query.kpiId;
    if (query.status) where.status = query.status;
    if (query.periodStart && query.periodEnd) {
      where.periodStart = Between(query.periodStart, query.periodEnd);
    }

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({ where, relations: ['employee', 'employee.person', 'kpi', 'kpi.evaluationType'], skip, take: limit });
    return { page, limit, total, data };
  }

  async findOne(companyId: string, id: string): Promise<EmployeeKPI> {
    const row = await this.repo.findOne({ where: { companyId, id }, relations: ['employee', 'employee.person', 'kpi'] });
    if (!row) throw new NotFoundException('EmployeeKPI not found');
    return row;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeKpiDto): Promise<EmployeeKPI> {
    const row = await this.findOne(companyId, id);

    // se mudar chaves da unique, checar duplicidade
    const keysChange =
      (dto.employeeId && dto.employeeId !== row.employeeId) ||
      (dto.kpiId && dto.kpiId !== row.kpiId) ||
      (dto.periodStart && dto.periodStart !== row.periodStart) ||
      (dto.periodEnd && dto.periodEnd !== row.periodEnd)

    if (keysChange) {
      const dup = await this.repo.findOne({
        where: {
          companyId: dto.companyId ?? row.companyId,
          employeeId: dto.employeeId ?? row.employeeId,
          kpiId: dto.kpiId ?? row.kpiId,
          periodStart: dto.periodStart ?? row.periodStart,
          periodEnd: dto.periodEnd ?? row.periodEnd,
        } as any,
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Another EmployeeKPI exists with the same unique keys.');
      }
    }

    const merged = this.repo.merge(row, dto as any);
    return this.repo.save(merged);
  }

  async approve(companyId: string, id: string, approverUserId: string): Promise<EmployeeKPI> {
    const row = await this.findOne(companyId, id);
    if (row.status === KpiStatus.APPROVED) return row;
    if (row.status === KpiStatus.REJECTED) throw new BadRequestException('Cannot approve a rejected KPI.');

    row.status = KpiStatus.APPROVED;
    row.approvedBy = approverUserId;
    row.approvedDate = new Date();
    return this.repo.save(row);
  }

  async reject(companyId: string, id: string, approverUserId: string, reason?: string): Promise<EmployeeKPI> {
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