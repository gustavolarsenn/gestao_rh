import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';
import { Company } from '../../org/entities/company.entity';
import { Branch } from '../../org/entities/branch.entity';

@Entity('cities')
export class City extends AuditedBaseEntity {
  @Column() name!: string;

  @Column('uuid')
  stateId!: string;

  @ManyToOne(() => State, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stateId' })
  state!: State;

  @OneToMany(() => Company, (company) => company.city)
  companies?: Company[];

  @OneToMany(() => Branch, (branch) => branch.city)
  branches?: Branch[];
}
