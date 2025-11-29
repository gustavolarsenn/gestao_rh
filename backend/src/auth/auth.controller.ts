import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    companyId: string;
    role?: string;
    employeeId?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    // req.user vem do JwtStrategy.validate()
    return req.user;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email);

    // mensagem padrão SEMPRE igual
    return {
      message:
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto);
    // resposta sempre "genérica"
    return {
      message: 'Se o token for válido, a senha foi redefinida com sucesso.',
    };
  }
  // @Public()
  // @Post('register')
  // async register(@Body() dto: RegisterDto) {
  //   return this.auth.register(dto);
  // }
}