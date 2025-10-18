import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserRole, UserStatus } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    validate(payload: JwtPayload): Promise<{
        id: any;
        email: any;
        role: any;
        status: any;
        emailVerified: any;
        phoneVerified: any;
        profileCompleted: any;
        twoFactorEnabled: any;
    }>;
}
export {};
