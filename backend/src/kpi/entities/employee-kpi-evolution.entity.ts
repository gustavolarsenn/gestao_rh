import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Employee } from '../../hr/entities/employee.entity';
import { User } from '../../users/entities/user.entity';
import { KpiStatus } from './kpi.enums';
import { Company } from '../../org/entities/company.entity';
import { EmployeeKPI } from './employee-kpi.entity';
import { Team } from '../../team/entities/team.entity';

@Entity('employee_kpi_evolutions')
@Unique('uq_emp_kpi_ev_period', ['companyId','employeeId','employeeKpiId','submittedDate'])
export class EmployeeKPIEvolution extends TenantBaseEntity {
  @Column('uuid') employeeId!: string;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee!: Employee;
  
  @Column('uuid') teamId!: string;
  @ManyToOne(() => Team, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'teamId' }) team!: Team;

  @Column('uuid') employeeKpiId!: string;
  @ManyToOne(() => EmployeeKPI, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeKpiId' }) employeeKpi!: EmployeeKPI;

  @Column({ nullable: true }) achievedValueEvolution?: string;

  // avaliação de gestor: quem avaliou
  @Column('uuid', { nullable: true }) raterEmployeeId?: string | null;
  @ManyToOne(() => Employee, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'raterEmployeeId' }) raterEmployee?: Employee | null;

  // workflow
  @Column({ type: 'enum', enum: KpiStatus, default: KpiStatus.DRAFT }) status!: KpiStatus;

  @Column('uuid') submittedBy!: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'submittedBy' }) submittedByUser!: User;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) submittedDate!: Date;

  @Column('uuid', { nullable: true }) approvedBy?: string | null;
  @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'approvedBy' }) approvedByUser?: User | null;
  @Column({ type: 'timestamptz', nullable: true }) approvedDate?: Date | null;

  @Column({ type: 'text', nullable: true }) rejectionReason?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
