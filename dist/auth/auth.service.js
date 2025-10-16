"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        console.log('loginDto ascgaskcja.cjgacha', loginDto);
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            include: {
                candidate: true,
                admin: true,
                superAdmin: true,
                company: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is suspended');
        }
        if (user.status === client_1.UserStatus.INACTIVE) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        if (user.twoFactorEnabled) {
            const twoFactorCode = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 5);
            await this.prisma.oTP.create({
                data: {
                    userId: user.id,
                    code: twoFactorCode,
                    type: client_1.OTPType.TWO_FACTOR_AUTH,
                    expiresAt,
                },
            });
            return {
                success: false,
                message: '2FA verification required',
                data: {
                    requires2FA: true,
                    userId: user.id,
                    twoFactorCode: twoFactorCode,
                },
            };
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const sessionToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.loginSession.create({
            data: {
                userId: user.id,
                sessionToken,
                expiresAt,
                isActive: true,
            },
        });
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        await this.prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                level: 'INFO',
                description: 'User logged in successfully',
                entity: 'User',
                entityId: user.id,
            },
        });
        const authResponse = {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
                profileCompleted: user.profileCompleted,
                twoFactorEnabled: user.twoFactorEnabled,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
        };
        return {
            success: true,
            message: 'Login successful',
            data: authResponse,
        };
    }
    async logout(userId) {
        try {
            await this.prisma.loginSession.updateMany({
                where: {
                    userId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    action: 'LOGOUT',
                    level: 'INFO',
                    description: 'User logged out',
                    entity: 'User',
                    entityId: userId,
                },
            });
            return {
                success: true,
                message: 'Logout successful',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to logout');
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (user.status === client_1.UserStatus.SUSPENDED) {
                throw new common_1.UnauthorizedException('Account is suspended');
            }
            if (user.status === client_1.UserStatus.INACTIVE) {
                throw new common_1.UnauthorizedException('Account is inactive');
            }
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
            };
            const accessToken = this.jwtService.sign(newPayload, {
                expiresIn: '1d',
            });
            const newRefreshToken = this.jwtService.sign(newPayload, {
                expiresIn: '7d',
            });
            return {
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: forgotPasswordDto.email },
        });
        if (!user) {
            return {
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            };
        }
        const resetToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.oTP.create({
            data: {
                userId: user.id,
                code: resetToken,
                type: client_1.OTPType.PASSWORD_RESET,
                expiresAt,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'CREATE',
                level: 'INFO',
                description: 'Password reset requested',
                entity: 'User',
                entityId: user.id,
            },
        });
        return {
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            data: {
                email: forgotPasswordDto.email,
                resetToken: resetToken,
                expiresAt: expiresAt,
            },
        };
    }
    async validateUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                candidate: true,
                admin: true,
                superAdmin: true,
                company: true,
            },
        });
        if (!user) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }
    async resetPassword(resetPasswordDto) {
        const otp = await this.prisma.oTP.findFirst({
            where: {
                code: resetPasswordDto.token,
                type: client_1.OTPType.PASSWORD_RESET,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: otp.userId },
            data: { password: hashedPassword },
        });
        await this.prisma.oTP.update({
            where: { id: otp.id },
            data: {
                used: true,
                usedAt: new Date(),
            },
        });
        await this.prisma.loginSession.updateMany({
            where: {
                userId: otp.userId,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        await this.prisma.activityLog.create({
            data: {
                userId: otp.userId,
                action: 'UPDATE',
                level: 'INFO',
                description: 'Password reset successfully',
                entity: 'User',
                entityId: otp.userId,
            },
        });
        return {
            success: true,
            message: 'Password reset successfully',
        };
    }
    async candidateRegister(candidateRegisterDto) {
        try {
            console.log('candidateRegisterDto ', candidateRegisterDto);
            const existingUser = await this.prisma.user.findUnique({
                where: { email: candidateRegisterDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            if (candidateRegisterDto.phone) {
                const existingPhoneUser = await this.prisma.user.findUnique({
                    where: { phone: candidateRegisterDto.phone },
                });
                if (existingPhoneUser) {
                    throw new common_1.BadRequestException('User with this phone number already exists');
                }
            }
            if (candidateRegisterDto.cityId) {
                const city = await this.prisma.city.findUnique({
                    where: { id: parseInt(candidateRegisterDto.cityId) },
                });
                if (!city) {
                    throw new common_1.BadRequestException('Invalid city ID provided');
                }
                if (!city.isActive) {
                    throw new common_1.BadRequestException('The selected city is not active');
                }
            }
            const hashedPassword = await bcrypt.hash(candidateRegisterDto.password, 10);
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: candidateRegisterDto.email,
                        password: hashedPassword,
                        phone: candidateRegisterDto.phone,
                        role: client_1.UserRole.CANDIDATE,
                        status: client_1.UserStatus.PENDING_VERIFICATION,
                        emailVerified: false,
                        phoneVerified: false,
                        profileCompleted: false,
                        twoFactorEnabled: false,
                    },
                });
                const candidate = await prisma.candidate.create({
                    data: {
                        userId: user.id,
                        firstName: candidateRegisterDto.firstName,
                        lastName: candidateRegisterDto.lastName,
                        dateOfBirth: candidateRegisterDto.dateOfBirth
                            ? new Date(candidateRegisterDto.dateOfBirth)
                            : null,
                        gender: candidateRegisterDto.gender,
                        bio: candidateRegisterDto.bio,
                        currentTitle: candidateRegisterDto.currentTitle,
                        address: candidateRegisterDto.address,
                        linkedinUrl: candidateRegisterDto.linkedinUrl,
                        githubUrl: candidateRegisterDto.githubUrl,
                        portfolioUrl: candidateRegisterDto.portfolioUrl,
                        cityId: candidateRegisterDto.cityId ? parseInt(candidateRegisterDto.cityId) : null,
                        isAvailable: candidateRegisterDto.isAvailable ?? true,
                    },
                });
                return { user, candidate };
            });
            const verificationCode = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.prisma.oTP.create({
                data: {
                    userId: result.user.id,
                    code: verificationCode,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    expiresAt,
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: result.user.id,
                    action: 'CREATE',
                    level: 'INFO',
                    description: 'Candidate registered successfully',
                    entity: 'User',
                    entityId: result.user.id,
                },
            });
            return {
                success: true,
                message: 'Candidate registered successfully. Please check your email for verification.',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        status: result.user.status,
                        emailVerified: result.user.emailVerified,
                        phoneVerified: result.user.phoneVerified,
                        profileCompleted: result.user.profileCompleted,
                        twoFactorEnabled: result.user.twoFactorEnabled,
                        createdAt: result.user.createdAt,
                    },
                    candidate: {
                        id: result.candidate.id,
                        firstName: result.candidate.firstName,
                        lastName: result.candidate.lastName,
                        isAvailable: result.candidate.isAvailable,
                        createdAt: result.candidate.createdAt,
                    },
                },
            };
        }
        catch (error) {
            console.log('actual error', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to register candidate');
        }
    }
    async candidateSimpleRegister(candidateSimpleRegisterDto) {
        try {
            console.log('candidateSimpleRegisterDto ', candidateSimpleRegisterDto);
            const existingUser = await this.prisma.user.findUnique({
                where: { email: candidateSimpleRegisterDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            const nameParts = candidateSimpleRegisterDto.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';
            if (!firstName) {
                throw new common_1.BadRequestException('Full name must contain at least a first name');
            }
            const hashedPassword = await bcrypt.hash(candidateSimpleRegisterDto.password, 10);
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: candidateSimpleRegisterDto.email,
                        password: hashedPassword,
                        role: client_1.UserRole.CANDIDATE,
                        status: client_1.UserStatus.PENDING_VERIFICATION,
                        emailVerified: false,
                        phoneVerified: false,
                        profileCompleted: false,
                        twoFactorEnabled: false,
                    },
                });
                const candidate = await prisma.candidate.create({
                    data: {
                        userId: user.id,
                        firstName: firstName,
                        lastName: lastName,
                        isAvailable: true,
                    },
                });
                return { user, candidate };
            });
            const verificationCode = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.prisma.oTP.create({
                data: {
                    userId: result.user.id,
                    code: verificationCode,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    expiresAt,
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: result.user.id,
                    action: 'CREATE',
                    level: 'INFO',
                    description: 'Candidate registered successfully (simple registration)',
                    entity: 'User',
                    entityId: result.user.id,
                },
            });
            return {
                success: true,
                message: 'Candidate registered successfully. Please check your email for verification.',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        status: result.user.status,
                        emailVerified: result.user.emailVerified,
                        phoneVerified: result.user.phoneVerified,
                        profileCompleted: result.user.profileCompleted,
                        twoFactorEnabled: result.user.twoFactorEnabled,
                        createdAt: result.user.createdAt,
                    },
                    candidate: {
                        id: result.candidate.id,
                        firstName: result.candidate.firstName,
                        lastName: result.candidate.lastName,
                        isAvailable: result.candidate.isAvailable,
                        createdAt: result.candidate.createdAt,
                    },
                },
            };
        }
        catch (error) {
            console.log('actual error', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to register candidate');
        }
    }
    async companyRegister(companyRegisterDto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: companyRegisterDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            if (companyRegisterDto.cityId) {
                const city = await this.prisma.city.findUnique({
                    where: { id: parseInt(companyRegisterDto.cityId) },
                });
                if (!city) {
                    throw new common_1.BadRequestException('Invalid city ID provided');
                }
                if (!city.isActive) {
                    throw new common_1.BadRequestException('The selected city is not active');
                }
            }
            const hashedPassword = await bcrypt.hash(companyRegisterDto.password, 10);
            const slug = companyRegisterDto.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') +
                '-' +
                Date.now();
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: companyRegisterDto.email,
                        password: hashedPassword,
                        role: client_1.UserRole.COMPANY,
                        status: client_1.UserStatus.PENDING_VERIFICATION,
                        emailVerified: false,
                        phoneVerified: false,
                        profileCompleted: false,
                        twoFactorEnabled: false,
                    },
                });
                const company = await prisma.company.create({
                    data: {
                        userId: user.id,
                        name: companyRegisterDto.name,
                        slug: slug,
                        description: companyRegisterDto.description,
                        website: companyRegisterDto.website,
                        industry: companyRegisterDto.industry,
                        foundedYear: companyRegisterDto.foundedYear,
                        employeeCount: companyRegisterDto.employeeCount,
                        headquarters: companyRegisterDto.headquarters,
                        address: companyRegisterDto.address,
                        cityId: companyRegisterDto.cityId ? parseInt(companyRegisterDto.cityId) : null,
                        linkedinUrl: companyRegisterDto.linkedinUrl,
                        twitterUrl: companyRegisterDto.twitterUrl,
                        facebookUrl: companyRegisterDto.facebookUrl,
                        isVerified: companyRegisterDto.isVerified ?? false,
                        isActive: companyRegisterDto.isActive ?? true,
                    },
                });
                return { user, company };
            });
            const verificationCode = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.prisma.oTP.create({
                data: {
                    userId: result.user.id,
                    code: verificationCode,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    expiresAt,
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: result.user.id,
                    action: 'CREATE',
                    level: 'INFO',
                    description: 'Company registered successfully',
                    entity: 'User',
                    entityId: result.user.id,
                },
            });
            return {
                success: true,
                message: 'Company registered successfully. Please check your email for verification.',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        role: result.user.role,
                        status: result.user.status,
                        emailVerified: result.user.emailVerified,
                        phoneVerified: result.user.phoneVerified,
                        profileCompleted: result.user.profileCompleted,
                        twoFactorEnabled: result.user.twoFactorEnabled,
                        createdAt: result.user.createdAt,
                    },
                    company: {
                        id: result.company.id,
                        name: result.company.name,
                        slug: result.company.slug,
                        isVerified: result.company.isVerified,
                        isActive: result.company.isActive,
                        createdAt: result.company.createdAt,
                    },
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to register company');
        }
    }
    async verifyEmail(verifyEmailDto) {
        try {
            const otp = await this.prisma.oTP.findFirst({
                where: {
                    userId: verifyEmailDto.userId,
                    code: verifyEmailDto.code,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!otp) {
                throw new common_1.BadRequestException('Invalid or expired verification code');
            }
            await this.prisma.$transaction(async (prisma) => {
                await prisma.oTP.update({
                    where: { id: otp.id },
                    data: {
                        used: true,
                        usedAt: new Date(),
                    },
                });
                await prisma.user.update({
                    where: { id: verifyEmailDto.userId },
                    data: {
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                        status: client_1.UserStatus.ACTIVE,
                    },
                });
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: verifyEmailDto.userId,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: 'Email verified successfully',
                    entity: 'User',
                    entityId: verifyEmailDto.userId,
                },
            });
            return {
                success: true,
                message: 'Email verified successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify email');
        }
    }
    async verifyPhone(verifyPhoneDto) {
        try {
            const otp = await this.prisma.oTP.findFirst({
                where: {
                    userId: verifyPhoneDto.userId,
                    code: verifyPhoneDto.code,
                    type: client_1.OTPType.PHONE_VERIFICATION,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!otp) {
                throw new common_1.BadRequestException('Invalid or expired verification code');
            }
            await this.prisma.$transaction(async (prisma) => {
                await prisma.oTP.update({
                    where: { id: otp.id },
                    data: {
                        used: true,
                        usedAt: new Date(),
                    },
                });
                await prisma.user.update({
                    where: { id: verifyPhoneDto.userId },
                    data: {
                        phoneVerified: true,
                        phoneVerifiedAt: new Date(),
                    },
                });
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: verifyPhoneDto.userId,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: 'Phone verified successfully',
                    entity: 'User',
                    entityId: verifyPhoneDto.userId,
                },
            });
            return {
                success: true,
                message: 'Phone verified successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify phone');
        }
    }
    async resendOtp(resendOtpDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: resendOtpDto.email },
            });
            if (!user) {
                return {
                    success: true,
                    message: 'If an account with that email exists, a new verification code has been sent.',
                };
            }
            await this.prisma.oTP.updateMany({
                where: {
                    userId: user.id,
                    type: resendOtpDto.type,
                    used: false,
                },
                data: {
                    used: true,
                    usedAt: new Date(),
                },
            });
            const newOtpCode = (0, uuid_1.v4)();
            const expiresAt = new Date();
            if (resendOtpDto.type === client_1.OTPType.EMAIL_VERIFICATION) {
                expiresAt.setHours(expiresAt.getHours() + 24);
            }
            else if (resendOtpDto.type === client_1.OTPType.PHONE_VERIFICATION) {
                expiresAt.setMinutes(expiresAt.getMinutes() + 10);
            }
            else if (resendOtpDto.type === client_1.OTPType.PASSWORD_RESET) {
                expiresAt.setHours(expiresAt.getHours() + 1);
            }
            else {
                expiresAt.setMinutes(expiresAt.getMinutes() + 5);
            }
            await this.prisma.oTP.create({
                data: {
                    userId: user.id,
                    code: newOtpCode,
                    type: resendOtpDto.type,
                    expiresAt,
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'CREATE',
                    level: 'INFO',
                    description: `OTP resent for ${resendOtpDto.type}`,
                    entity: 'User',
                    entityId: user.id,
                },
            });
            return {
                success: true,
                message: 'If an account with that email exists, a new verification code has been sent.',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to resend OTP');
        }
    }
    async enable2Fa(userId, enable2FaDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(enable2FaDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
            if (user.twoFactorEnabled) {
                throw new common_1.BadRequestException('2FA is already enabled');
            }
            const secret = speakeasy.generateSecret({
                name: `SpearWin (${user.email})`,
                issuer: 'SpearWin',
                length: 32,
            });
            const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());
            const qrCode = await QRCode.toDataURL(secret.otpauth_url);
            await this.prisma.$transaction(async (prisma) => {
                await prisma.user.update({
                    where: { id: userId },
                    data: { twoFactorEnabled: true },
                });
                await prisma.userSetting.upsert({
                    where: { userId_key: { userId, key: '2fa_secret' } },
                    update: { value: secret.base32 },
                    create: {
                        userId,
                        key: '2fa_secret',
                        value: secret.base32,
                        category: 'security',
                    },
                });
                await prisma.userSetting.upsert({
                    where: { userId_key: { userId, key: '2fa_backup_codes' } },
                    update: { value: JSON.stringify(backupCodes) },
                    create: {
                        userId,
                        key: '2fa_backup_codes',
                        value: JSON.stringify(backupCodes),
                        category: 'security',
                    },
                });
            });
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: '2FA enabled successfully',
                    entity: 'User',
                    entityId: userId,
                },
            });
            return {
                success: true,
                message: '2FA enabled successfully. Please scan the QR code with your authenticator app.',
                data: {
                    secret: secret.base32,
                    qrCode,
                    backupCodes,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to enable 2FA');
        }
    }
    async disable2Fa(userId, disable2FaDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(disable2FaDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
            if (!user.twoFactorEnabled) {
                throw new common_1.BadRequestException('2FA is not enabled');
            }
            await this.prisma.$transaction(async (prisma) => {
                await prisma.user.update({
                    where: { id: userId },
                    data: { twoFactorEnabled: false },
                });
                await prisma.userSetting.deleteMany({
                    where: {
                        userId,
                        key: { in: ['2fa_secret', '2fa_backup_codes'] },
                    },
                });
            });
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: '2FA disabled successfully',
                    entity: 'User',
                    entityId: userId,
                },
            });
            return {
                success: true,
                message: '2FA disabled successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to disable 2FA');
        }
    }
    async verify2Fa(verify2FaDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: verify2FaDto.userId },
                include: {
                    settings: {
                        where: { key: '2fa_secret' },
                    },
                },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            if (!user.twoFactorEnabled) {
                throw new common_1.BadRequestException('2FA is not enabled');
            }
            const secretSetting = user.settings.find((s) => s.key === '2fa_secret');
            if (!secretSetting) {
                throw new common_1.BadRequestException('2FA secret not found');
            }
            const verified = speakeasy.totp.verify({
                secret: secretSetting.value,
                encoding: 'base32',
                token: verify2FaDto.code,
                window: 2,
            });
            if (!verified) {
                const backupCodesSetting = await this.prisma.userSetting.findUnique({
                    where: {
                        userId_key: {
                            userId: verify2FaDto.userId,
                            key: '2fa_backup_codes',
                        },
                    },
                });
                if (backupCodesSetting) {
                    const backupCodes = JSON.parse(backupCodesSetting.value);
                    const codeIndex = backupCodes.indexOf(verify2FaDto.code);
                    if (codeIndex !== -1) {
                        backupCodes.splice(codeIndex, 1);
                        await this.prisma.userSetting.update({
                            where: {
                                userId_key: {
                                    userId: verify2FaDto.userId,
                                    key: '2fa_backup_codes',
                                },
                            },
                            data: { value: JSON.stringify(backupCodes) },
                        });
                        await this.prisma.activityLog.create({
                            data: {
                                userId: verify2FaDto.userId,
                                action: 'UPDATE',
                                level: 'WARNING',
                                description: '2FA backup code used',
                                entity: 'User',
                                entityId: verify2FaDto.userId,
                            },
                        });
                        return {
                            success: true,
                            message: '2FA verified successfully (backup code used)',
                        };
                    }
                }
                throw new common_1.BadRequestException('Invalid 2FA code');
            }
            await this.prisma.activityLog.create({
                data: {
                    userId: verify2FaDto.userId,
                    action: 'VIEW',
                    level: 'INFO',
                    description: '2FA verified successfully',
                    entity: 'User',
                    entityId: verify2FaDto.userId,
                },
            });
            return {
                success: true,
                message: '2FA verified successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify 2FA');
        }
    }
    async generateBackupCodes(generateBackupCodesDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: generateBackupCodesDto.userId },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(generateBackupCodesDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Invalid password');
            }
            if (!user.twoFactorEnabled) {
                throw new common_1.BadRequestException('2FA is not enabled');
            }
            const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());
            await this.prisma.userSetting.upsert({
                where: {
                    userId_key: {
                        userId: generateBackupCodesDto.userId,
                        key: '2fa_backup_codes',
                    },
                },
                update: { value: JSON.stringify(backupCodes) },
                create: {
                    userId: generateBackupCodesDto.userId,
                    key: '2fa_backup_codes',
                    value: JSON.stringify(backupCodes),
                    category: 'security',
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: generateBackupCodesDto.userId,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: '2FA backup codes regenerated',
                    entity: 'User',
                    entityId: generateBackupCodesDto.userId,
                },
            });
            return {
                success: true,
                message: 'Backup codes generated successfully',
                data: {
                    backupCodes,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to generate backup codes');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map