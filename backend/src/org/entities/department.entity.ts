import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from './company.entity';

@Entity('departments')
export class Department extends TenantBaseEntity {
  @Column() name!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
