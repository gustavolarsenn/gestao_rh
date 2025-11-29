// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../common/email/email.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET', 'dev'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES', '1d') },
      }),
    }),
    TypeOrmModule.forFeature([PasswordResetToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
