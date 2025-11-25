import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { HrModule } from './hr/hr.module';
import { OrgModule } from './org/org.module';
import { TeamModule } from './team/team.module';
import { KpiModule } from './kpi/kpi.module';
import { PerformanceReviewsModule } from './reviews/performance-reviews.module';
import { GeoModule } from './geo/geo.module';
import { DatabaseSeedModule } from './database/database.module';
import { PersonsModule } from './person/persons.module';

import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'),
        ssl: false,

        autoLoadEntities: true,
        synchronize: cfg.get<string>('NODE_ENV') !== 'production',
        logging: ['error', 'warn'],

        migrations: ['dist/database/migrations/*.{js}'],
        migrationsRun: false,
      }),
    }),
    AuthModule,
    UsersModule,
    PersonsModule,
    HrModule,
    OrgModule,
    TeamModule,
    KpiModule,
    PerformanceReviewsModule,
    GeoModule,
    DatabaseSeedModule,
    MonitoringModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}