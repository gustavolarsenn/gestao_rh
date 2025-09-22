import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const serviceMock: Partial<AppService> = {
    getInfo: () => ({
      name: 'Organizational Performance API',
      version: 'test',
      docs: '/api',
      status: 'ok' as const,
      time: '2025-01-01T00:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: serviceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('GET / -> getRoot retorna informações da API', () => {
    const res = appController.getRoot();
    expect(res.status).toBe('ok');
    expect(res.name).toBe('Organizational Performance API');
  });

  it('GET /health -> retorna ok', () => {
    const res = appController.getHealth();
    expect(res.status).toBe('ok');
    expect(typeof res.uptime).toBe('number');
  });
});
