import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerPathDto } from './create-career-path.dto';

export class UpdateCareerPathDto extends PartialType(CreateCareerPathDto) {}