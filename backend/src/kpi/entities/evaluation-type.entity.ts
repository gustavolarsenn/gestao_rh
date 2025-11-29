import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';
import { Department } from '../../org/entities/department.entity';

export enum EvaluationCode {
  HIGHER_BETTER_SUM = 'HIGHER_BETTER_SUM',
  LOWER_BETTER_SUM = 'LOWER_BETTER_SUM',
  HIGHER_BETTER_PCT = 'HIGHER_BETTER_PCT',
  LOWER_BETTER_PCT = 'LOWER_BETTER_PCT',
  BINARY = 'BINARY',
}

@Entity('evaluation_types')
@Unique(['companyId', 'code', 'name', 'departmentId'])
export class EvaluationType extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ type: 'enum', enum: EvaluationCode }) code!: EvaluationCode;
  @Column({ type: 'text', nullable: true }) description?: string | null;
  @Column({ nullable: true }) departmentId?: string;
  @Column() companyId!: string;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
