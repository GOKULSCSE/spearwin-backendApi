import { UserRole, UserStatus } from '@prisma/client';
export interface CurrentUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    profileCompleted: boolean;
    twoFactorEnabled: boolean;
}
export declare const GetCurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
