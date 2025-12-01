import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Department } from '../../org/entities/department.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('teams')
export class Team extends TenantBaseEntity {
  @Column() name!: string;

  @Column() description!: string;
  
  @Column('uuid', { nullable: true })
  parentTeamId?: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}
