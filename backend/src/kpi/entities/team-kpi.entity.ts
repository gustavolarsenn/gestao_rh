import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Team } from '../../team/entities/team.entity';
import { KPI } from './kpi.entity';
import { EvaluationType } from './evaluation-type.entity';
import { User } from '../../users/entities/user.entity';
import { KpiStatus } from './kpi.enums';
import { Company } from '../../org/entities/company.entity';

@Entity('team_kpis')
@Unique('uq_team_kpi_period', ['companyId','teamId','kpiId','periodStart','periodEnd'])
export class TeamKPI extends TenantBaseEntity {
  @Column('uuid') teamId!: string;
  @ManyToOne(() => Team, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'teamId' }) team!: Team;

  @Column('uuid') kpiId!: string;
  @ManyToOne(() => KPI, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'kpiId' }) kpi!: KPI;

  @Column('uuid') evaluationTypeId!: string;
  @ManyToOne(() => EvaluationType, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'evaluationTypeId' }) evaluationType!: EvaluationType;

  @Index() @Column({ type: 'date' }) periodStart!: string;
  @Index() @Column({ type: 'date' }) periodEnd!: string;

  @Column({ type: 'numeric', nullable: true }) goal?: string | null;
  @Column({ type: 'numeric', nullable: true }) achievedValue?: string | null;

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
