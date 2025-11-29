// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailService } from '../common/email/email.service';
import { ResetPasswordDto } from './dto/reset-password';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService, private emailService: EmailService) {}

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
        level: found.role?.level ?? null
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    // normaliza o e-mail
    const normalizedEmail = email.trim().toLowerCase();

    // procura qualquer usuário com esse e-mail
    const users = await this.users.findAnyByEmail(normalizedEmail);

    if (!users || users.length === 0) {
      // NÃO revela que não existe usuário
      return;
    }

    const user = users[0]; // se tiver várias contas com o mesmo e-mail, aqui você decide a regra

    // TODO: ideal é persistir esse token (hash + expiresAt) em uma tabela
    const token = crypto.randomUUID();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(normalizedEmail, resetLink);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.users.findAnyByEmail(dto.email);
    if (!user || user.length === 0) {
      // NÃO revela que não existe usuário
      return;
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    (user[0] as any).passwordHash = passwordHash;
    await (this.users as any).repo.save(user[0]); // ou expor um método específico de update de senha
  }

  // REGISTER continua pedindo companyId
  // async register(dto: CreateUserDto) {
  //   const exists = await this.users.findByEmail(dto.companyId, dto.email);
  //   if (exists) throw new ConflictException('Email already in use for this company');
  //   const created = await this.users.create({
  //     companyId: dto.companyId,
  //     name: dto.name,
  //     email: dto.email,
  //     password: dto.password,
  //     person: { id: dto.personId },
  //     userRoleId:  dto.userRoleId ,
  //   } as Partial<User>);

  //   const payload = { sub: created.id, companyId: created.companyId, email: created.email };
  //   const accessToken = await this.jwt.signAsync(payload);
  //   return {
  //     accessToken,
  //     user: { id: created.id, name: created.name, email: created.email, companyId: created.companyId },
  //   };
  // }
}
