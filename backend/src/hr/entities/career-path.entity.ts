import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';

@Entity('career_paths')
export class CareerPath extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ type: 'text', nullable: true }) description?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
