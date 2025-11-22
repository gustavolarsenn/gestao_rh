import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base-entity';
import { Employee } from '../../hr/entities/employee.entity';
import { Company } from '../../org/entities/company.entity';

@Entity('performance_reviews')
@Index(['companyId', 'employeeId', 'date'])
export class PerformanceReview extends TenantBaseEntity {
  // funcionário avaliado
  @Column('uuid')
  employeeId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee;

  @Column('uuid')
  leaderId!: string;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leaderId' })
  leader!: Employee;

  @Column({ type: 'text', nullable: true })
  observation?: string | null;

  @Column({ type: 'date' })
  date!: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;
}