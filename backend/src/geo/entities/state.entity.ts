import { Entity, Column } from 'typeorm';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';

@Entity('states')
export class State extends AuditedBaseEntity {
  @Column() name!: string;
  @Column({ length: 2 }) uf!: string;
}
