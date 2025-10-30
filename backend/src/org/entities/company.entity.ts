import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';
import { City } from '../../geo/entities/city.entity';

@Entity('companies')
export class Company extends AuditedBaseEntity {
  @Column() name!: string;
  @Column() cnpj!: string;
  @Column({ nullable: true }) address?: string;
  @Column({ nullable: true }) addressNumber?: string;
  @Column({ nullable: true }) zipCode?: string;

  // foreign key column
  @Column({ nullable: true }) cityId?: string;

  // relation
  @ManyToOne(() => City, city => city.companies, { nullable: true })
  @JoinColumn({ name: 'cityId' })
  city?: City;
}
