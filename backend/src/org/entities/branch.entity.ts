import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from './company.entity';

@Entity('branches')
export class Branch extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ type: 'date', nullable: true }) openingDate?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
