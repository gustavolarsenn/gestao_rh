import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Team } from './team.entity';
import { Employee } from '../../hr/entities/employee.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('team_members')
@Unique('uq_team_member_period', ['teamId', 'employeeId', 'startDate'])
export class TeamMember extends TenantBaseEntity {
  @Column('uuid') teamId!: string;
  @ManyToOne(() => Team, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'teamId' }) team!: Team;

  @Column('uuid') employeeId!: string;
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'employeeId' }) employee!: Employee;

  // Hierarquia (pai) ancorada ao membership conforme sua decisão
  @Column('uuid', { nullable: true }) parentTeamId?: string | null;
  @ManyToOne(() => Team, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'parentTeamId' }) parentTeam?: Team | null;

  @Column({ default: false }) isLeader!: boolean;

  @Column({ type: 'date' }) startDate!: string;
  @Column({ type: 'date', nullable: true }) endDate?: string | null;

  // Índice útil para derivar uma "vista" de pais únicos por time
  @Index() @Column({ type: 'boolean', default: false })
  isHierarchyEdge!: boolean;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
