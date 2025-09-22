import { IsString, MinLength, IsUUID } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsUUID()
  stateId!: string;
}