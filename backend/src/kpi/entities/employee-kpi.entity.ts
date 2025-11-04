import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Employee } from '../../hr/entities/employee.entity';
import { KPI } from './kpi.entity';
import { EvaluationType } from './evaluation-type.entity';
import { User } from '../../users/entities/user.entity';
import { KpiStatus } from './kpi.enums';
import { Company } from '../../org/entities/company.entity';
import { Team } from '../../team/entities/team.entity';

@Entity('employee_kpis')
@Unique('uq_emp_kpi_period', ['companyId','employeeId','kpiId','periodStart','periodEnd'])
export class EmployeeKPI extends TenantBaseEntity {
  @Column('uuid') employeeId!: string;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee!: Employee;

  @Column('uuid') teamId!: string;
  @ManyToOne(() => Team, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'teamId' }) team!: Team;

  @Column('uuid') kpiId!: string;
  @ManyToOne(() => KPI, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'kpiId' }) kpi!: KPI;

  @Column('uuid') evaluationTypeId!: string;
  @ManyToOne(() => EvaluationType, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'evaluationTypeId' }) evaluationType!: EvaluationType;

  // período
  @Index() @Column({ type: 'date' }) periodStart!: string;
  @Index() @Column({ type: 'date' }) periodEnd!: string;

  // metas x realizado
  @Column({ nullable: true }) goal?: string;
  @Column({ nullable: true }) achievedValue?: string;

  // avaliação de gestor: quem avaliou
  @Column('uuid', { nullable: true }) raterEmployeeId?: string | null;
  @ManyToOne(() => Employee, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'raterEmployeeId' }) raterEmployee?: Employee | null;

  // workflow
  @Column({ type: 'enum', enum: KpiStatus, default: KpiStatus.DRAFT }) status!: KpiStatus;

  @Column('uuid') submittedBy!: string;
  @ManyToOne(() => User, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'submittedBy' }) submittedByUser!: User;
  @Column({ type: 'timestamptz' }) submittedDate!: Date;

  @Column('uuid', { nullable: true }) approvedBy?: string | null;
  @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'approvedBy' }) approvedByUser?: User | null;
  @Column({ type: 'timestamptz', nullable: true }) approvedDate?: Date | null;

  @Column({ type: 'text', nullable: true }) rejectionReason?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
