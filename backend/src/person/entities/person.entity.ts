import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';
import { City } from '../../geo/entities/city.entity';
    
@Entity('persons')
export class Person extends TenantBaseEntity {
  @Column() name!: string;
  @Column() email!: string;
  @Column({ type: 'date', nullable: true }) birthDate?: string | null;
  @Column({ nullable: true }) phone?: string;
  @Column({ nullable: true }) address?: string;
  @Column({ nullable: true }) addressNumber?: string;
  @Column({ nullable: true }) zipCode?: string;
  @Column() cpf!: string;
  @Column('uuid', { nullable: true }) cityId?: string | null;
  @ManyToOne(() => City, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'cityId' }) city?: City | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
