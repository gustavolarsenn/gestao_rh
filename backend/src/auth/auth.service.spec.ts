import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const userMock = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    companyId: 'company-1',
    role: { level: 2 },
  } as any;

  beforeEach(() => {
    usersService = {
      findAnyByEmail: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    service = new AuthService(usersService, jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve fazer login com sucesso e retornar token + dados do usuário', async () => {
    usersService.findAnyByEmail.mockResolvedValue([userMock]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('fake-jwt-token');

    const result = await service.login({
      email: 'john@example.com',
      password: '123456',
    });

    expect(usersService.findAnyByEmail).toHaveBeenCalledWith(
      'john@example.com',
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      '123456',
      userMock.passwordHash,
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: userMock.id,
      companyId: userMock.companyId,
      email: userMock.email,
    });

    expect(result).toEqual({
      accessToken: 'fake-jwt-token',
      user: {
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
        companyId: userMock.companyId,
        level: userMock.role.level,
      },
    });
  });

  it('deve lançar UnauthorizedException quando usuário não é encontrado', async () => {
    usersService.findAnyByEmail.mockResolvedValue([]);

    await expect(
      service.login({ email: 'notfound@example.com', password: '123456' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersService.findAnyByEmail).toHaveBeenCalledWith(
      'notfound@example.com',
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException quando a senha é inválida', async () => {
    usersService.findAnyByEmail.mockResolvedValue([userMock]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'john@example.com', password: 'wrong-pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersService.findAnyByEmail).toHaveBeenCalledWith(
      'john@example.com',
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrong-pass',
      userMock.passwordHash,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
