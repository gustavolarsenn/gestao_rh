import { Column } from 'typeorm';
import { AuditedBaseEntity } from './audited-base.entity';

export abstract class TenantBaseEntity extends AuditedBaseEntity {
  @Column('uuid')
  companyId!: string;
}
