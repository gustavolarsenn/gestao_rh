import { IsString, MinLength } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  uf!: string;
}