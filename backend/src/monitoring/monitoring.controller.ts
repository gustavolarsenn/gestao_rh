// src/monitoring/metrics.controller.ts
import { Controller, Get, Header } from '@nestjs/common';
import { register } from 'prom-client';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class MetricsController {
  @Public()
  @Get('metrics')
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
