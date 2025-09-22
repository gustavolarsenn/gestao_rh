import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([State, City])],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [TypeOrmModule, GeoService],
})
export class GeoModule {}