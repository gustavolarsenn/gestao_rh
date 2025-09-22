import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Employee } from './employee.entity';
import { Role } from '../../org/entities/role.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('employee_histories')
export class EmployeeHistory extends TenantBaseEntity {
  @Column('uuid') employeeId!: string;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee!: Employee;

  @Column('uuid', { nullable: true }) roleId?: string | null;
  @ManyToOne(() => Role, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'roleId' }) role?: Role | null;

  @Column({ type: 'numeric', nullable: true }) wage?: string | null;
  @Column({ type: 'date' }) startDate!: string;
  @Column({ type: 'date', nullable: true }) endDate?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
