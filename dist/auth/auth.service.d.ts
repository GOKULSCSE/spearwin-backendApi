import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CandidateRegisterDto } from './dto/candidate-register.dto';
import { CandidateSimpleRegisterDto } from './dto/candidate-simple-register.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Enable2FaDto } from './dto/2fa-enable.dto';
import { Disable2FaDto } from './dto/2fa-disable.dto';
import { Verify2FaDto } from './dto/2fa-verify.dto';
import { GenerateBackupCodesDto } from './dto/backup-codes.dto';
import { LoginResponseDto, RefreshResponseDto, ForgotPasswordResponseDto, ResetPasswordResponseDto, LogoutResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: DatabaseService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    logout(userId: string): Promise<LogoutResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto>;
    validateUserById(userId: string): Promise<any>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponseDto>;
    candidateRegister(candidateRegisterDto: CandidateRegisterDto): Promise<RegisterResponseDto>;
    candidateSimpleRegister(candidateSimpleRegisterDto: CandidateSimpleRegisterDto): Promise<RegisterResponseDto>;
    companyRegister(companyRegisterDto: CompanyRegisterDto): Promise<RegisterResponseDto>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    enable2Fa(userId: string, enable2FaDto: Enable2FaDto): Promise<{
        success: boolean;
        message: string;
        data: {
            secret: string;
            qrCode: string;
            backupCodes: string[];
        };
    }>;
    disable2Fa(userId: string, disable2FaDto: Disable2FaDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verify2Fa(verify2FaDto: Verify2FaDto): Promise<{
        success: boolean;
        message: string;
    }>;
    generateBackupCodes(generateBackupCodesDto: GenerateBackupCodesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            backupCodes: string[];
        };
    }>;
}
