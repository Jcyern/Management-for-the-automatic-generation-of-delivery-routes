import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './Auth.service.js';
import { LoginDto } from './dto/Auth.dto.js';
import { RegisterDto } from './dto/Register.dto.js';
import { Public } from './public.decorator.js';
import { Roles } from './roles.decorator.js';
import { RolEfectivo } from './roles.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @Roles(RolEfectivo.ADMINISTRADOR)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}

/**
 * Alias deprecado para el frontend actual, que llama a POST /SignIn
 * y espera el usuario directamente.
 * Se elimina cuando el frontend use /auth/login y el token.
 */
@Controller()
export class LegacyAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('SignIn')
  async signIn(@Body() dto: LoginDto) {
    const { user } = await this.authService.login(dto);
    return user;
  }
}