import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get(AppService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('getInfo deve retornar informações básicas', () => {
    const result = service.getInfo();

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('docs', '/api');
  });
});
