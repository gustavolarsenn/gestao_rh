import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { HrModule } from './hr/hr.module';
import { OrgModule } from './org/org.module';
import { TeamModule } from './team/team.module';
import { KpiModule } from './kpi/kpi.module';
import { PerformanceReviewsModule } from './reviews/performance-reviews.module';
import { GeoModule } from './geo/geo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    HrModule,
    OrgModule,
    TeamModule,
    KpiModule,
    PerformanceReviewsModule,
    GeoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
