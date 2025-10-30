import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Department } from './department.entity';
import { Company } from './company.entity';
import { RoleType } from './role-type.entity';

@Entity('roles')
export class Role extends TenantBaseEntity {
  @Column() name!: string;

  @Column('uuid')
  departmentId!: string;

  @Column('uuid')
  roleTypeId!: string;

  @ManyToOne(() => RoleType, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roleTypeId' })
  roleType?: RoleType | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department?: Department | null;

  @Column({ type: 'numeric', nullable: true })
  defaultWage?: number | null; // use NUMERIC para moeda

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
