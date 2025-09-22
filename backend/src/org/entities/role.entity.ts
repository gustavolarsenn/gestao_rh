import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Department } from './department.entity';
import { Company } from './company.entity';

@Entity('roles')
export class Role extends TenantBaseEntity {
  @Column() name!: string;

  @Column('uuid', { nullable: true })
  departmentId?: string | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department?: Department | null;

  @Column({ type: 'numeric', nullable: true })
  defaultWage?: string | null; // use NUMERIC para moeda

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
