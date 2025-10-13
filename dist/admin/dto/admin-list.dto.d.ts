import { UserRole, UserStatus } from '@prisma/client';
export declare class AdminListQueryDto {
    search?: string;
    department?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class AdminListResponseDto {
    admins: AdminProfileResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
