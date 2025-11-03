import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';
import { Department } from '../../org/entities/department.entity';

export enum EvaluationCode {
  HIGHER_BETTER = 'HIGHER_BETTER',
  LOWER_BETTER = 'LOWER_BETTER',
  BINARY = 'BINARY',
}

@Entity('evaluation_types')
export class EvaluationType extends TenantBaseEntity {
  @Column({ unique: true }) name!: string;
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
