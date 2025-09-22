import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Organizational Performance API',
      version: process.env.npm_package_version ?? 'dev',
      docs: '/api', // ajuste se você expor Swagger depois
      status: 'ok' as const,
      time: new Date().toISOString(),
    };
  }
}
