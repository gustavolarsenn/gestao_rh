import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Department } from '../../org/entities/department.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('teams')
export class Team extends TenantBaseEntity {
  @Column() name!: string;

  @Column('uuid', { nullable: true })
  departmentId?: string | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department?: Department | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
