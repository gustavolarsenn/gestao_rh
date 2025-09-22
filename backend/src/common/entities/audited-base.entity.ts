import {
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne,
  PrimaryGeneratedColumn, BaseEntity as TypeOrmBase, JoinColumn
} from 'typeorm';

export abstract class AuditedBaseEntity extends TypeOrmBase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: string;

  @Column({ default: true })
  active!: boolean;
}
