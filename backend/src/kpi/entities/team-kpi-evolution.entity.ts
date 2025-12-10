import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Team } from '../../team/entities/team.entity';
import { EvaluationType } from './evaluation-type.entity';
import { User } from '../../users/entities/user.entity';
import { KpiStatus } from './kpi.enums';
import { Company } from '../../org/entities/company.entity';
import { TeamKPI } from './team-kpi.entity';
import { EmployeeKPI } from './employee-kpi.entity';

@Entity('team_kpi_evolutions')
@Unique('uq_team_kpi_ev_period', ['companyId','teamId','teamKpiId','submittedDate'])
export class TeamKPIEvolution extends TenantBaseEntity {
  @Column('uuid') teamId!: string;
  @ManyToOne(() => Team, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'teamId' }) team!: Team;

  @Column('uuid') teamKpiId!: string;
  @ManyToOne(() => TeamKPI, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'teamKpiId' }) teamKpi!: TeamKPI;

  @Column('uuid') employeeKpiId?: string;
  @ManyToOne(() => EmployeeKPI, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'employeeKpiId' }) employeeKpi?: EmployeeKPI;

  @Column({ nullable: true }) achievedValueEvolution?: string;

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
