import { IsUUID, IsString, IsEmail, IsOptional, IsBoolean, MinLength, IsDateString } from 'class-validator';
import { Person } from '../../person/entities/person.entity';

export class CreateUserDto {
  @IsUUID() companyId!: string;
  @IsUUID() userRoleId!: string;
  @IsUUID() personId!: string;
  @IsString() name!: string;
  
  @IsOptional() @IsEmail() email?: string;

  @MinLength(8) password!: string;

  person!: Person;
  @IsOptional() @IsBoolean() isActive?: boolean;
}