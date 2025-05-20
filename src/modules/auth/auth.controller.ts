import { Body, Controller, Post, Get, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { EnableTwoFactorDto, VerifyTwoFactorDto, DisableTwoFactorDto } from './dto/two-factor.dto';

@ApiTags('Auth')
@ApiBearerAuth('JWT')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Body() enableDto: EnableTwoFactorDto) {
    return this.authService.enableTwoFactor(enableDto);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verifyTwoFactor(@Body() verifyDto: VerifyTwoFactorDto) {
    return this.authService.verifyTwoFactor(verifyDto);
  }

  @Delete('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactor(@Body() disableDto: DisableTwoFactorDto) {
    return this.authService.disableTwoFactor(disableDto);
  }

  @Get('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken() {
    return this.authService.refreshToken();
  }
}
