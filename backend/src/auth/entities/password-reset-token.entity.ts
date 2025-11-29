// src/auth/entities/password-reset-token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;

  // nunca guarde o token em texto puro
  @Column()
  tokenHash?: string;

  @Column({ type: 'timestamp' })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date | null;

  @CreateDateColumn()
  createdAt?: Date;
}
