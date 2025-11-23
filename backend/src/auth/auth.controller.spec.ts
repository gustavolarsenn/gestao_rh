import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve delegar para AuthService.login e retornar o resultado', async () => {
      const dto = { email: 'john@example.com', password: '123456' } as any;
      const expected = { accessToken: 'token', user: { id: '1' } };

      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getProfile', () => {
    it('deve retornar o usuário do request', async () => {
      const req: any = {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          companyId: 'company-1',
          role: 'admin',
        },
      };

      const result = await controller.getProfile(req);

      expect(result).toEqual(req.user);
    });
  });
});
