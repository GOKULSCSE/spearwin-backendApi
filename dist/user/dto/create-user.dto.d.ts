import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    twoFactorEnabled?: boolean;
}
