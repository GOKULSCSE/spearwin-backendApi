import { UserRole, UserStatus } from '@prisma/client';
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        profileCompleted: boolean;
        twoFactorEnabled: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
    };
    requires2FA?: boolean;
    twoFactorCode?: string;
}
export declare class LoginResponseDto {
    success: boolean;
    message: string;
    data: AuthResponseDto | {
        requires2FA: boolean;
        userId: string;
        twoFactorCode?: string;
    };
}
export declare class RefreshResponseDto {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}
export declare class ForgotPasswordResponseDto {
    success: boolean;
    message: string;
}
export declare class ResetPasswordResponseDto {
    success: boolean;
    message: string;
}
export declare class LogoutResponseDto {
    success: boolean;
    message: string;
}
export declare class RegisterResponseDto {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            role: UserRole;
            status: UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            profileCompleted: boolean;
            twoFactorEnabled: boolean;
            createdAt: Date;
        };
        candidate?: {
            id: string;
            firstName: string;
            lastName: string;
            isAvailable: boolean;
            createdAt: Date;
        };
        company?: {
            id: string;
            name: string;
            slug: string;
            isVerified: boolean;
            isActive: boolean;
            createdAt: Date;
        };
    };
}
