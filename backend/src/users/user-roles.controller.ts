import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';
import { UserRolesService } from './user-roles.service';

@Controller('user-roles')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UserRolesController {
  constructor(private readonly service: UserRolesService) {}

  @Post()
  create(@Body() dto: CreateUserRoleDto): Promise<UserRole> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<UserRole[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserRole> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserRole> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.service.remove(id);
  }
}