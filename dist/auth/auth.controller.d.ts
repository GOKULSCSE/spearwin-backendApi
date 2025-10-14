import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CandidateRegisterDto } from './dto/candidate-register.dto';
import { CandidateRegisterSimpleDto } from './dto/candidate-register-simple.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Enable2FaDto } from './dto/2fa-enable.dto';
import { Disable2FaDto } from './dto/2fa-disable.dto';
import { Verify2FaDto } from './dto/2fa-verify.dto';
import { GenerateBackupCodesDto } from './dto/backup-codes.dto';
import type { CurrentUser } from './decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    candidateRegister(candidateRegisterDto: CandidateRegisterDto): Promise<import("./dto/auth-response.dto").RegisterResponseDto>;
    candidateRegisterSimple(candidateRegisterSimpleDto: CandidateRegisterSimpleDto): Promise<any>;
    companyRegister(companyRegisterDto: CompanyRegisterDto): Promise<import("./dto/auth-response.dto").RegisterResponseDto>;
    login(loginDto: LoginDto): Promise<import("./dto/auth-response.dto").LoginResponseDto>;
    logout(user: CurrentUser): Promise<import("./dto/auth-response.dto").LogoutResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<import("./dto/auth-response.dto").RefreshResponseDto>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<import("./dto/auth-response.dto").ForgotPasswordResponseDto>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<import("./dto/auth-response.dto").ResetPasswordResponseDto>;
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
    enable2Fa(user: CurrentUser, enable2FaDto: Enable2FaDto): Promise<{
        success: boolean;
        message: string;
        data: {
            secret: string;
            qrCode: string;
            backupCodes: string[];
        };
    }>;
    disable2Fa(user: CurrentUser, disable2FaDto: Disable2FaDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verify2Fa(verify2FaDto: Verify2FaDto): Promise<{
        success: boolean;
        message: string;
    }>;
    generateBackupCodes(user: CurrentUser, generateBackupCodesDto: GenerateBackupCodesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            backupCodes: string[];
        };
    }>;
}
