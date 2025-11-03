import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';
import { UserRole } from './user-role.entity';
import { Person } from '../../person/entities/person.entity';

@Entity('users')
export class User extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ nullable: true }) email?: string;
  @Column() passwordHash!: string;

  @Column()
  personId!: string;

  @OneToOne(() => Person, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'personId' })
  person!: Person;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column({ nullable: true })
  userRoleId?: string;

  @ManyToOne(() => UserRole, { nullable: true, eager: true })
  @JoinColumn({ name: 'userRoleId' })
  role?: UserRole;
}
