"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const auth_service_1 = require("../auth.service");
const client_1 = require("@prisma/client");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    authService;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
            passReqToCallback: false,
        });
        this.authService = authService;
    }
    async validate(payload) {
        this.logger.log(`🔍 Validating JWT payload: ${JSON.stringify(payload)}`);
        this.logger.log(`🔑 JWT Secret being used: ${process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET (using default)'}`);
        if (!payload || !payload.sub) {
            this.logger.warn('❌ Invalid JWT payload: missing sub field');
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        try {
            const user = await this.authService.validateUserById(payload.sub);
            if (!user) {
                this.logger.warn(`❌ User not found for ID: ${payload.sub}`);
                throw new common_1.UnauthorizedException('User not found');
            }
            this.logger.log(`👤 Found user: ${user.email} with role: ${user.role}`);
            if (user.status === client_1.UserStatus.SUSPENDED) {
                this.logger.warn(`❌ Account suspended for user: ${user.email}`);
                throw new common_1.UnauthorizedException('Account is suspended');
            }
            if (user.status === client_1.UserStatus.INACTIVE) {
                this.logger.warn(`❌ Account inactive for user: ${user.email}`);
                throw new common_1.UnauthorizedException('Account is inactive');
            }
            this.logger.log(`✅ Successfully validated user: ${user.email} (Role: ${user.role})`);
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                profileCompleted: user.profileCompleted,
                twoFactorEnabled: user.twoFactorEnabled,
            };
        }
        catch (error) {
            this.logger.error(`❌ JWT validation error: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map