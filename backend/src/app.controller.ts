import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return this.appService.getInfo();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' as const, uptime: process.uptime() };
  }
}
