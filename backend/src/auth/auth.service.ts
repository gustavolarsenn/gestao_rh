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
      },
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
