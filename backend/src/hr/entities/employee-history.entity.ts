import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Employee } from './employee.entity';
import { Role } from '../../org/entities/role.entity';
import { Company } from '../../org/entities/company.entity';
import { Branch } from '../../org/entities/branch.entity';
import { Department } from '../../org/entities/department.entity';
import { RoleType } from '../../org/entities/role-type.entity';
import { Team } from '../../team/entities/team.entity';

@Entity('employee_histories')
export class EmployeeHistory extends TenantBaseEntity {
  @Column('uuid') employeeId!: string;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee!: Employee;

  @Column('uuid', { nullable: true }) roleId?: string | null;
  @ManyToOne(() => Role, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'roleId' }) role?: Role | null;
  @Column('uuid', { nullable: true }) roleTypeId?: string | null;
  @ManyToOne(() => RoleType, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'roleTypeId' }) roleType?: RoleType | null;
  @Column('uuid', { nullable: true }) teamId?: string | null;
  @ManyToOne(() => Team, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'teamId' }) team?: Team | null;
  @Column('uuid', { nullable: true }) departmentId?: string | null;
  @ManyToOne(() => Department, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'departmentId' }) department?: Department | null;
  @Column('uuid', { nullable: true }) branchId?: string | null;
  @ManyToOne(() => Branch, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'branchId' }) branch?: Branch | null;

  @Column({ type: 'numeric', nullable: true }) wage?: string | null;
  @Column({ type: 'date' }) startDate!: string;
  @Column({ type: 'date', nullable: true }) endDate?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
