import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: jest.Mocked<AppService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AppController);
    service = module.get(AppService) as any;
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('GET / deve retornar getInfo()', () => {
    const mockInfo = {
      name: 'Organizational Performance API',
      version: '1.0.0',
      docs: '/api',
      status: 'ok' as const,
      time: new Date().toISOString(),
    };

    service.getInfo.mockReturnValue(mockInfo);

    const result = controller.getRoot();

    expect(service.getInfo).toHaveBeenCalled();
    expect(result).toEqual(mockInfo);
  });


  it('GET /health deve retornar status ok', () => {
    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
  });
});
