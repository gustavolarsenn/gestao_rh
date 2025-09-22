import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { City } from '../../geo/entities/city.entity';
import { Role } from '../../org/entities/role.entity';
import { RoleType } from '../../org/entities/role-type.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../org/entities/branch.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('employees')
export class Employee extends TenantBaseEntity {
  @Column() name!: string;

  @Column({ type: 'date', nullable: true }) birthDate?: string | null;

  @Column('uuid', { nullable: true }) cityId?: string | null;
  @ManyToOne(() => City, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'cityId' }) city?: City | null;

  @Column({ nullable: true }) address?: string;
  @Column({ nullable: true }) addressNumber?: string;

  @Column('uuid', { nullable: true }) roleId?: string | null;
  @ManyToOne(() => Role, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'roleId' }) role?: Role | null;

  @Column('uuid', { nullable: true }) roleTypeId?: string | null;
  @ManyToOne(() => RoleType, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'roleTypeId' }) roleType?: RoleType | null;

  @Column('uuid', { nullable: true }) userId?: string | null;
  @ManyToOne(() => User, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'userId' }) user?: User | null;

  @Column('uuid', { nullable: true }) branchId?: string | null;
  @ManyToOne(() => Branch, { onDelete: 'SET NULL' }) @JoinColumn({ name: 'branchId' }) branch?: Branch | null;

  @Column({ type: 'numeric', nullable: true }) wage?: string | null;

  @Column({ type: 'date', nullable: true }) hiringDate?: string | null;
  @Column({ type: 'date', nullable: true }) departureDate?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
