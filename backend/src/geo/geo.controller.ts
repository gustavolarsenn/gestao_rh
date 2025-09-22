import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GeoController {
  constructor(private readonly service: GeoService) {}

  // ===== States =====
  // Coloque @Public() se quiser popular sem JWT:
  // @Public()
  @Post('states')
  createState(@Body() dto: CreateStateDto) {
    return this.service.createState(dto);
  }

  @Get('states')
  listStates() {
    return this.service.findAllStates();
  }

  @Get('states/:id')
  getState(@Param('id') id: string) {
    return this.service.findOneState(id);
  }

  @Patch('states/:id')
  updateState(@Param('id') id: string, @Body() dto: UpdateStateDto) {
    return this.service.updateState(id, dto);
  }

  @Delete('states/:id')
  deleteState(@Param('id') id: string) {
    return this.service.removeState(id);
  }

  // ===== Cities =====
  // @Public()
  @Post('cities')
  createCity(@Body() dto: CreateCityDto) {
    return this.service.createCity(dto);
  }

  @Get('cities')
  listCities(@Query('stateId') stateId?: string) {
    return this.service.findAllCities(stateId);
  }

  @Get('cities/:id')
  getCity(@Param('id') id: string) {
    return this.service.findOneCity(id);
  }

  @Patch('cities/:id')
  updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto) {
    return this.service.updateCity(id, dto);
  }

  @Delete('cities/:id')
  deleteCity(@Param('id') id: string) {
    return this.service.removeCity(id);
  }
}