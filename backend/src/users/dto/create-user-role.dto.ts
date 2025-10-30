import { IsString } from 'class-validator';

export class CreateUserRoleDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsString() level!: number;
}