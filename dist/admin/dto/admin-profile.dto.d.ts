export declare class UpdateAdminProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    department?: string;
    designation?: string;
}
export declare class AdminProfileResponseDto {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    department?: string | null;
    designation?: string | null;
    permissions?: any;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
        phone?: string | null;
        phoneVerified: boolean;
        role: string;
        status: string;
        profileCompleted: boolean;
        twoFactorEnabled: boolean;
        lastLoginAt?: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
