import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from './company.entity';
import { City } from '../../geo/entities/city.entity';

@Entity('branches')
export class Branch extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ type: 'date', nullable: true }) openingDate?: string | null;

  @Column() cnpj!: string;
  @Column({ nullable: true }) address?: string;
  @Column({ nullable: true }) addressNumber?: string;
  @Column({ nullable: true }) zipCode?: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @ManyToOne(() => City, city => city.branches, { nullable: true })
  @JoinColumn({ name: 'cityId' })
  city?: City;
}
