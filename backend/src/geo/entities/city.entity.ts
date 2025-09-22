import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { State } from './state.entity';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';

@Entity('cities')
export class City extends AuditedBaseEntity {
  @Column() name!: string;

  @Column('uuid')
  stateId!: string;

  @ManyToOne(() => State, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stateId' })
  state!: State;
}
