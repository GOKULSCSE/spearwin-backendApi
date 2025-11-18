import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CandidateRegisterDto } from './dto/candidate-register.dto';
import { CandidateSimpleRegisterDto } from './dto/candidate-simple-register.dto';
import { CandidateRegisterSimpleDto } from './dto/candidate-register-simple.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Enable2FaDto } from './dto/2fa-enable.dto';
import { Disable2FaDto } from './dto/2fa-disable.dto';
import { Verify2FaDto } from './dto/2fa-verify.dto';
import { GenerateBackupCodesDto } from './dto/backup-codes.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetCurrentUser } from './decorators/current-user.decorator';
import type { CurrentUser } from './decorators/current-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/candidate')
  @HttpCode(HttpStatus.CREATED)
  async candidateRegister(@Body() candidateRegisterDto: CandidateRegisterDto) {
    return this.authService.candidateRegister(candidateRegisterDto);
  }

  @Post('register/candidate/simple')
  @HttpCode(HttpStatus.CREATED)
  async candidateSimpleRegister(@Body() candidateSimpleRegisterDto: CandidateSimpleRegisterDto) {
    return this.authService.candidateSimpleRegister(candidateSimpleRegisterDto);
  }

  @Post('register/company')
  @HttpCode(HttpStatus.CREATED)
  async companyRegister(@Body() companyRegisterDto: CompanyRegisterDto) {
    return this.authService.companyRegister(companyRegisterDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUser() user: CurrentUser) {
    return this.authService.logout(user.id);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Get('verify-email')
  async verifyEmailGet(
    @Query('token') token: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    if (!token || !userId) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/verify-email?error=Invalid verification link`);
    }

    try {
      const result = await this.authService.verifyEmail({ userId, code: token });
      
      // If verification successful, auto-login the user
      if (result.success && result.userId) {
        const loginResult = await this.authService.autoLoginAfterVerification(result.userId);

        if (loginResult.success && loginResult.data && 'accessToken' in loginResult.data) {
          const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
          // Redirect to auto-login page with tokens
          const accessToken = encodeURIComponent(loginResult.data.accessToken);
          const refreshToken = encodeURIComponent(loginResult.data.refreshToken);
          return res.redirect(`${frontendUrl}/auto-login?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        }
      }
      
      // Fallback to login page if auto-login fails
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?verified=true`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
      const errorMessage = error.message || 'Verification failed';
      return res.redirect(`${frontendUrl}/verify-email?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enable2Fa(
    @GetCurrentUser() user: CurrentUser,
    @Body() enable2FaDto: Enable2FaDto,
  ) {
    return this.authService.enable2Fa(user.id, enable2FaDto);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2Fa(
    @GetCurrentUser() user: CurrentUser,
    @Body() disable2FaDto: Disable2FaDto,
  ) {
    return this.authService.disable2Fa(user.id, disable2FaDto);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2Fa(@Body() verify2FaDto: Verify2FaDto) {
    return this.authService.verify2Fa(verify2FaDto);
  }

  @Post('2fa/generate-backup-codes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateBackupCodes(
    @GetCurrentUser() user: CurrentUser,
    @Body() generateBackupCodesDto: GenerateBackupCodesDto,
  ) {
    return this.authService.generateBackupCodes(generateBackupCodesDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto);
  }
}
