import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Company } from '../../org/entities/company.entity';
import { Role } from '../../org/entities/role.entity';
import { Department } from '../../org/entities/department.entity';

@Unique('uq_career_path_edge', [
  'companyId',
  'department',
  'currentRoleId',
  'nextRoleId',
])
@Entity('career_paths')
export class CareerPath extends TenantBaseEntity {
  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'departmentId' })
  department!: Department;

  @Column('uuid')
  currentRoleId!: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currentRoleId' })
  currentRole!: Role;

  @Column('uuid')
  nextRoleId!: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nextRoleId' })
  nextRole!: Role;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ default: false })
  isEntryPoint!: boolean;
}
