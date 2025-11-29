// src/auth/dto/reset-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  email!: string;
  
  @IsString()
  @MinLength(8)
  password!: string;
}
