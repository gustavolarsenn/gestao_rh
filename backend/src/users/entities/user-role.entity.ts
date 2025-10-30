import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AuditedBaseEntity } from '../../common/entities/audited-base.entity';

@Entity('user_roles')
export class UserRole extends AuditedBaseEntity {
  @Column() name!: string;
  @Column() description!: string;
  @Column() level!: number;
  @OneToMany(() => UserRole, userRole => userRole.id)
  users?: UserRole[];
}
