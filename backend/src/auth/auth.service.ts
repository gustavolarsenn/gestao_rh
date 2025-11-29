// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';

import { UsersService } from '../users/users.service';
import { EmailService } from '../common/email/email.service';
import { ResetPasswordDto } from './dto/reset-password';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetRepo: Repository<PasswordResetToken>,
  ) {}

  // LOGIN sem companyId
  async login({ email, password }: { email: string; password: string }) {
    const user = await this.users.findAnyByEmail(email);
    const found = user[0]; // ajustar se multiempresa

    if (!found) throw new UnauthorizedException('Credenciais inválidas');
    const valid = await bcrypt.compare(password, found.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const payload = {
      sub: found.id,
      companyId: found.companyId,
      email: found.email,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        companyId: found.companyId,
        level: found.role?.level ?? null,
      },
    };
  }

  // ===========================
  // ESQUECI MINHA SENHA
  // ===========================
  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const users = await this.users.findAnyByEmail(normalizedEmail);

    if (!users || users.length === 0) {
      // NÃO revela que não existe usuário
      return;
    }

    const user = users[0];

    // opcional: invalidar tokens anteriores não usados
        await this.passwordResetRepo.update(
          { userId: user.id, usedAt: IsNull() },
          { usedAt: new Date() },
        );

    // token aleatório
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await this.passwordResetRepo.save(
      this.passwordResetRepo.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // mando token + email no link (ajusta o frontend pra ler isso)
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      normalizedEmail,
    )}`;

    await this.emailService.sendPasswordResetEmail(normalizedEmail, resetLink);
  }

  // ===========================
  // RESET DE SENHA
  // ===========================
  async resetPassword(dto: ResetPasswordDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const users = await this.users.findAnyByEmail(normalizedEmail);
    if (!users || users.length === 0) {
      // não revela se existe ou não
      return;
    }

    const user = users[0];

    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const now = new Date();

    const resetToken = await this.passwordResetRepo.findOne({
      where: {
        userId: user.id,
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      } as any,
    });

    if (!resetToken) {
      throw new BadRequestException('Token de redefinição inválido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // ideal: criar um método específico no UsersService
    (user as any).passwordHash = passwordHash;
    await (this.users as any).repo.save(user);

    resetToken.usedAt = new Date();
    await this.passwordResetRepo.save(resetToken);
  }

  // REGISTER continua comentado...
}
