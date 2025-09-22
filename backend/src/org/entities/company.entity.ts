import { Entity, Column } from 'typeorm';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';

@Entity('companies')
export class Company extends AuditedBaseEntity {
  @Column() name!: string;
  @Column({ nullable: true }) cnpj?: string;
  @Column({ nullable: true }) address?: string;
  @Column({ nullable: true }) addressNumber?: string;
  @Column({ nullable: true }) zipCode?: string;
}
