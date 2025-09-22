import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationTypeDto } from './create-evaluation-type.dto';

export class UpdateEvaluationTypeDto extends PartialType(CreateEvaluationTypeDto) {}