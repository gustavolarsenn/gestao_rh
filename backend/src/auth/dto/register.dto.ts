import { IsEmail, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
export class RegisterDto {
  @IsUUID() companyId!: string;
  @IsUUID() userRoleId!: string;
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() password!: string;
  @IsOptional() @IsDateString() birthDate?: string | null;
}