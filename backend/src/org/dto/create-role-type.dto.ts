import { IsUUID, IsString } from 'class-validator';

export class CreateRoleTypeDto {
  @IsUUID() companyId!: string;
  @IsString() name!: string; // CLT, PJ, Horista, etc.
}