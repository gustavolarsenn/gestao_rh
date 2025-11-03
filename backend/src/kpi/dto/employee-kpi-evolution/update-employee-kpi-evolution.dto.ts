import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeKpiEvolutionDto } from './create-employee-kpi-evolution.dto';

export class UpdateEmployeeKpiEvolutionDto extends PartialType(CreateEmployeeKpiEvolutionDto) {}