// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  // LOGIN sem companyId
  async login({ email, password }: LoginDto) {
    const candidates = await this.users.findAnyByEmail(email);
    if (candidates.length === 0) throw new UnauthorizedException('Invalid credentials');

    // se o mesmo email existir em múltiplas empresas, peça para desambiguar
    if (candidates.length > 1) {
      throw new BadRequestException('Email found in multiple companies. Provide a unique email or login by company-specific route.');
      // Alternativas:
      // - aceitar um header X-Company-Id para desambiguar
      // - usar companySlug no corpo (em vez de UUID)
      // - exigir emails únicos no sistema (constraint global)
    }

    const user = candidates[0];
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, companyId: user.companyId, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, companyId: user.companyId },
    };
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
