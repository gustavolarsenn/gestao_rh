import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeKpiDto } from './create-employee-kpi.dto';

export class UpdateEmployeeKpiDto extends PartialType(CreateEmployeeKpiDto) {}