export declare enum UserRole {
    CANDIDATE = "CANDIDATE",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    COMPANY = "COMPANY"
}
export declare class CreateUserDto {
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    twoFactorEnabled?: boolean;
}
