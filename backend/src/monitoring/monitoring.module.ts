// src/monitoring/monitoring.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './monitoring.controller';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      // tira o `path` pra não criar outro /metrics interno
      // path: '/metrics',
    }),
  ],
  controllers: [MetricsController],
})
export class MonitoringModule {}
