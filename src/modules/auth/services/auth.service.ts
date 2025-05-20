import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from '../dto/login.dto';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';
import { EnableTwoFactorDto, VerifyTwoFactorDto, DisableTwoFactorDto } from '../dto/two-factor.dto';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.verifyPassword(pass))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @Public()
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        twoFactorRequired: true,
        userId: user.id,
      };
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      twoFactorRequired: false,
    };
  }

  @Public()
  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate reset token
    const resetToken = this.jwtService.sign({ userId: user.id }, {
      secret: this.configService.get<string>('JWT_RESET_SECRET'),
      expiresIn: '1h',
    });

    // Store reset token in user document
    await this.usersService.update(user.id, { resetToken });

    // Send email with reset link
    // TODO: Implement email service
    return { message: 'Password reset instructions sent to your email' };
  }

  @Public()
  async resetPassword(resetDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Verify reset token
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
      });

      const user = await this.usersService.findById(decoded.userId);
      if (!user || user.resetToken !== token) {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Update password
      await this.usersService.update(user.id, {
        password,
        resetToken: null,
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async enableTwoFactor(enableDto: EnableTwoFactorDto) {
    const user = await this.validateUser(enableDto.email, enableDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Generate secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(
      `otpauth://totp/${this.configService.get<string>('APP_NAME')}:${user.email}?secret=${secret.base32}&issuer=${this.configService.get<string>('APP_NAME')}`
    );

    await this.usersService.update(user.id, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: true,
    });

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyTwoFactor(verifyDto: VerifyTwoFactorDto) {
    const user = await this.usersService.findByEmail(verifyDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verifyDto.code,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate JWT with 2FA verified
    const payload = { username: user.username, sub: user.id, twoFactorVerified: true };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async disableTwoFactor(disableDto: DisableTwoFactorDto) {
    const user = await this.validateUser(disableDto.email, disableDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: disableDto.code,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.usersService.update(user.id, {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    });

    return { message: '2FA disabled successfully' };
  }

  async refreshToken() {
    // Get user from request context
    const user = this.usersService.findById(context.switchToHttp().getRequest().user.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
