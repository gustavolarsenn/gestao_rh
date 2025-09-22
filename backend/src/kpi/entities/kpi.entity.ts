import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Department } from '../../org/entities/department.entity';
import { EvaluationType } from './evaluation-type.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('kpis')
export class KPI extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ type: 'text', nullable: true }) description?: string | null;

  @Column('uuid', { nullable: true }) departmentId?: string | null;
  @ManyToOne(() => Department, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'departmentId' }) department?: Department | null;

  @Column('uuid') evaluationTypeId!: string;
  @ManyToOne(() => EvaluationType, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'evaluationTypeId' }) evaluationType!: EvaluationType;

  @Column({ nullable: true }) unit?: string; // %, h, pts, etc.

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
