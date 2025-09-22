import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleTypeDto } from './create-role-type.dto';

export class UpdateRoleTypeDto extends PartialType(CreateRoleTypeDto) {}