import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';

@Entity('users')
export class User extends TenantBaseEntity {
  @Column() name!: string;
  @Column({ unique: true }) email!: string;
  @Column() passwordHash!: string;
  @Column({ type: 'date', nullable: true }) birthDate?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
