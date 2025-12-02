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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const company_uuid_util_1 = require("../company/utils/company-uuid.util");
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    emailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async login(loginDto) {
        this.logger.log(`🔑 Login attempt for email: ${loginDto.email}`);
        const trimmedLoginPassword = loginDto.password?.trim() || '';
        this.logger.log(`🔑 Password length: ${trimmedLoginPassword.length}`);
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
            this.logger.warn(`❌ User not found: ${loginDto.email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.logger.log(`🔑 User found: ${user.email}`);
        this.logger.log(`🔑 Stored password hash length: ${user.password?.length || 0}`);
        this.logger.log(`🔑 Stored password hash exists: ${!!user.password}`);
        if (!user.password) {
            this.logger.error(`❌ User has no password set: ${user.email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.logger.log(`🔑 Hash starts with: ${user.password.substring(0, 10)}...`);
        this.logger.log(`🔑 Input password (first 3 chars): ${trimmedLoginPassword.substring(0, Math.min(3, trimmedLoginPassword.length))}***`);
        this.logger.log(`🔑 Input password length: ${trimmedLoginPassword.length}`);
        let isPasswordValid = await bcrypt.compare(trimmedLoginPassword, user.password);
        this.logger.log(`🔑 Password comparison result (trimmed): ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
        if (!isPasswordValid) {
            this.logger.warn(`❌ Invalid password for user: ${user.email}`);
            this.logger.warn(`   Input: ${trimmedLoginPassword.length} chars, Hash: ${user.password.length} chars`);
            const isPasswordValidOriginal = await bcrypt.compare(loginDto.password, user.password);
            this.logger.warn(`   Retry with original (untrimmed): ${isPasswordValidOriginal ? '✅ VALID' : '❌ INVALID'}`);
            if (isPasswordValidOriginal) {
                isPasswordValid = true;
                this.logger.log(`✅ Password validated with original (untrimmed) version`);
            }
            else {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
        }
        if (user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is suspended');
        }
        if (user.status === client_1.UserStatus.INACTIVE) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        if (!user.emailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email to continue');
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
                message: 'If an account with that email exists, a password reset OTP has been sent.',
            };
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        await this.prisma.oTP.create({
            data: {
                userId: user.id,
                code: otpCode,
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
        const isTransporterReady = this.emailService.isTransporterReady();
        if (!isTransporterReady) {
            this.logger.warn(`⚠️ Email transporter is not ready. Attempting to send password reset email anyway...`);
            this.logger.warn(`   Check backend logs for SMTP configuration errors.`);
        }
        const emailSent = await this.emailService.sendPasswordResetEmail(user.email, otpCode, expiresAt);
        if (!emailSent) {
            this.logger.error(`❌ Failed to send password reset email to ${user.email}`);
            this.logger.error(`   Possible causes:`);
            this.logger.error(`   1. SMTP configuration missing or incorrect (check .env file)`);
            this.logger.error(`   2. SMTP credentials invalid (wrong username/password)`);
            this.logger.error(`   3. Network connectivity issues`);
            this.logger.error(`   4. SMTP server blocking the connection`);
            this.logger.error(`   Check the email service logs above for detailed error information.`);
        }
        else {
            this.logger.log(`✅ Password reset email sent successfully to ${user.email}`);
            this.logger.log(`   OTP Code: ${otpCode} (expires in 5 minutes)`);
        }
        return {
            success: true,
            message: 'If an account with that email exists, a password reset OTP has been sent.',
            data: {
                email: forgotPasswordDto.email,
                otpCode: otpCode,
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
        if (!otp || !otp.user || !otp.userId) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        this.logger.log(`🔐 Resetting password for user: ${otp.user.email}`);
        const trimmedPassword = resetPasswordDto.newPassword.trim();
        this.logger.log(`🔐 New password length: ${trimmedPassword.length}`);
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        this.logger.log(`🔐 Password hashed successfully. Hash length: ${hashedPassword.length}`);
        await this.prisma.user.update({
            where: { id: otp.userId },
            data: { password: hashedPassword },
        });
        this.logger.log(`🔐 Password updated for user: ${otp.user.email}`);
        this.logger.log(`🔐 Verifying password was saved correctly...`);
        const updatedUser = await this.prisma.user.findUnique({
            where: { id: otp.userId },
            select: { id: true, email: true, password: true },
        });
        if (!updatedUser || !updatedUser.password) {
            this.logger.error(`❌ CRITICAL: User or password not found after update!`);
            throw new common_1.BadRequestException('Failed to update password');
        }
        this.logger.log(`🔐 Fetched user after update: ${updatedUser.email}`);
        this.logger.log(`🔐 Stored hash length: ${updatedUser.password.length}`);
        this.logger.log(`🔐 Hash starts with: ${updatedUser.password.substring(0, 10)}...`);
        const verifyPassword = await bcrypt.compare(trimmedPassword, updatedUser.password);
        this.logger.log(`🔐 Password verification after save: ${verifyPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (!verifyPassword) {
            this.logger.error(`❌ CRITICAL: Password verification failed immediately after saving!`);
            this.logger.error(`   Input password length: ${trimmedPassword.length}`);
            this.logger.error(`   Stored hash length: ${updatedUser.password.length}`);
            this.logger.error(`   This indicates a serious issue with password storage.`);
            throw new common_1.BadRequestException('Password was not saved correctly');
        }
        this.logger.log(`✅ Password reset successful for user: ${updatedUser.email}`);
        await this.prisma.oTP.update({
            where: { id: otp.id },
            data: {
                used: true,
                usedAt: new Date(),
            },
        });
        if (otp.userId) {
            await this.prisma.loginSession.updateMany({
                where: {
                    userId: otp.userId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });
        }
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
            try {
                await this.emailService.sendVerificationEmail(result.user.email, verificationCode, expiresAt, result.user.id);
                this.logger.log(`Verification email sent to ${result.user.email}`);
            }
            catch (emailError) {
                this.logger.error(`Failed to send verification email: ${emailError.message}`);
            }
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
            const existingPending = await this.prisma.pendingRegistration.findUnique({
                where: { email: candidateSimpleRegisterDto.email },
            });
            if (existingPending) {
                if (existingPending.expiresAt > new Date()) {
                    await this.prisma.pendingRegistration.delete({
                        where: { id: existingPending.id },
                    });
                }
                else {
                    await this.prisma.pendingRegistration.delete({
                        where: { id: existingPending.id },
                    });
                }
            }
            const nameParts = candidateSimpleRegisterDto.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';
            if (!firstName) {
                throw new common_1.BadRequestException('Full name must contain at least a first name');
            }
            const hashedPassword = await bcrypt.hash(candidateSimpleRegisterDto.password, 10);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            const pendingRegistration = await this.prisma.pendingRegistration.create({
                data: {
                    email: candidateSimpleRegisterDto.email,
                    password: hashedPassword,
                    fullName: candidateSimpleRegisterDto.fullName,
                    firstName: firstName,
                    lastName: lastName,
                    role: client_1.UserRole.CANDIDATE,
                    registrationData: JSON.stringify({
                        reenterPassword: candidateSimpleRegisterDto.reenterPassword,
                    }),
                    expiresAt,
                },
            });
            const verificationCode = (0, uuid_1.v4)();
            const otpExpiresAt = new Date();
            otpExpiresAt.setHours(otpExpiresAt.getHours() + 24);
            await this.prisma.oTP.create({
                data: {
                    pendingRegistrationId: pendingRegistration.id,
                    code: verificationCode,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    expiresAt: otpExpiresAt,
                },
            });
            try {
                await this.emailService.sendVerificationEmail(pendingRegistration.email, verificationCode, otpExpiresAt, pendingRegistration.id);
                this.logger.log(`Verification email sent to ${pendingRegistration.email}`);
            }
            catch (emailError) {
                this.logger.error(`Failed to send verification email: ${emailError.message}`);
                await this.prisma.pendingRegistration.delete({
                    where: { id: pendingRegistration.id },
                });
                throw new common_1.BadRequestException('Failed to send verification email. Please try again.');
            }
            return {
                success: true,
                message: 'Registration initiated. Please check your email for verification. Your account will be created after email verification.',
                data: {
                    user: {
                        id: pendingRegistration.id,
                        email: pendingRegistration.email,
                        role: pendingRegistration.role,
                        status: client_1.UserStatus.PENDING_VERIFICATION,
                        emailVerified: false,
                        phoneVerified: false,
                        profileCompleted: false,
                        twoFactorEnabled: false,
                        createdAt: pendingRegistration.createdAt,
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
            const hashedPassword = await bcrypt.hash(companyRegisterDto.password, 10);
            const slug = companyRegisterDto.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') +
                '-' +
                Date.now();
            const existingCompanies = await this.prisma.company.findMany({
                select: { uuid: true, companyId: true },
            });
            const existingUuids = existingCompanies.map(c => c.uuid).filter((uuid) => uuid !== null);
            const companyUuid = (0, company_uuid_util_1.generateCompanyUuid)(companyRegisterDto.name, existingUuids);
            const existingCompanyIds = existingCompanies.map(c => c.companyId).filter((id) => id !== null);
            const companyId = (0, company_uuid_util_1.generateCompanyId)(companyRegisterDto.name, existingCompanyIds);
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
                        uuid: companyUuid,
                        companyId: companyId,
                        description: companyRegisterDto.description,
                        website: companyRegisterDto.website,
                        industry: companyRegisterDto.industry,
                        foundedYear: companyRegisterDto.foundedYear,
                        employeeCount: companyRegisterDto.employeeCount,
                        headquarters: companyRegisterDto.headquarters,
                        address: companyRegisterDto.address,
                        country: companyRegisterDto.country,
                        state: companyRegisterDto.state,
                        city: companyRegisterDto.city,
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
                    OR: [
                        { userId: verifyEmailDto.userId },
                        { pendingRegistrationId: verifyEmailDto.userId },
                    ],
                    code: verifyEmailDto.code,
                    type: client_1.OTPType.EMAIL_VERIFICATION,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
                include: {
                    pendingRegistration: true,
                },
            });
            if (!otp) {
                throw new common_1.BadRequestException('Invalid or expired verification code');
            }
            if (otp.pendingRegistrationId && otp.pendingRegistration) {
                const pendingReg = otp.pendingRegistration;
                if (pendingReg.expiresAt < new Date()) {
                    throw new common_1.BadRequestException('Registration link has expired. Please register again.');
                }
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: pendingReg.email },
                });
                if (existingUser) {
                    await this.prisma.oTP.update({
                        where: { id: otp.id },
                        data: {
                            used: true,
                            usedAt: new Date(),
                        },
                    });
                    return {
                        success: true,
                        message: 'Email already verified',
                        userId: existingUser.id,
                    };
                }
                const result = await this.prisma.$transaction(async (prisma) => {
                    const user = await prisma.user.create({
                        data: {
                            email: pendingReg.email,
                            password: pendingReg.password,
                            role: pendingReg.role,
                            status: client_1.UserStatus.ACTIVE,
                            emailVerified: true,
                            emailVerifiedAt: new Date(),
                            phoneVerified: false,
                            profileCompleted: false,
                            twoFactorEnabled: false,
                        },
                    });
                    const candidate = await prisma.candidate.create({
                        data: {
                            userId: user.id,
                            firstName: pendingReg.firstName,
                            lastName: pendingReg.lastName,
                            isAvailable: true,
                        },
                    });
                    await prisma.oTP.update({
                        where: { id: otp.id },
                        data: {
                            used: true,
                            usedAt: new Date(),
                            userId: user.id,
                        },
                    });
                    await prisma.pendingRegistration.delete({
                        where: { id: pendingReg.id },
                    });
                    await prisma.activityLog.create({
                        data: {
                            userId: user.id,
                            action: 'CREATE',
                            level: 'INFO',
                            description: 'User account created and email verified',
                            entity: 'User',
                            entityId: user.id,
                        },
                    });
                    return { user, candidate };
                });
                return {
                    success: true,
                    message: 'Email verified successfully. Your account has been created.',
                    userId: result.user.id,
                };
            }
            else {
                if (!otp.userId) {
                    throw new common_1.BadRequestException('Invalid verification code');
                }
                await this.prisma.$transaction(async (prisma) => {
                    await prisma.oTP.update({
                        where: { id: otp.id },
                        data: {
                            used: true,
                            usedAt: new Date(),
                        },
                    });
                    if (otp.userId) {
                        await prisma.user.update({
                            where: { id: otp.userId },
                            data: {
                                emailVerified: true,
                                emailVerifiedAt: new Date(),
                                status: client_1.UserStatus.ACTIVE,
                            },
                        });
                    }
                });
                await this.prisma.activityLog.create({
                    data: {
                        userId: otp.userId,
                        action: 'UPDATE',
                        level: 'INFO',
                        description: 'Email verified successfully',
                        entity: 'User',
                        entityId: otp.userId,
                    },
                });
                return {
                    success: true,
                    message: 'Email verified successfully',
                    userId: otp.userId,
                };
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify email');
        }
    }
    async autoLoginAfterVerification(userId) {
        try {
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
                throw new common_1.NotFoundException('User not found');
            }
            if (user.status === client_1.UserStatus.SUSPENDED) {
                throw new common_1.UnauthorizedException('Account is suspended');
            }
            if (user.status === client_1.UserStatus.INACTIVE) {
                throw new common_1.UnauthorizedException('Account is inactive');
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
                    description: 'User auto-logged in after email verification',
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
                message: 'Auto-login successful',
                data: authResponse,
            };
        }
        catch (error) {
            this.logger.error(`Failed to auto-login user after verification: ${error.message}`);
            throw error;
        }
    }
    async verifyOtp(verifyOtpDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: verifyOtpDto.email },
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid email address');
            }
            const otp = await this.prisma.oTP.findFirst({
                where: {
                    userId: user.id,
                    code: verifyOtpDto.otp,
                    type: client_1.OTPType.PASSWORD_RESET,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!otp) {
                throw new common_1.BadRequestException('Invalid or expired OTP code');
            }
            return {
                success: true,
                verified: true,
                message: 'OTP verified successfully. You can now reset your password.',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify OTP');
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
            if (resendOtpDto.type === client_1.OTPType.EMAIL_VERIFICATION) {
                const pendingReg = await this.prisma.pendingRegistration.findUnique({
                    where: { email: resendOtpDto.email },
                });
                if (pendingReg) {
                    if (pendingReg.expiresAt < new Date()) {
                        await this.prisma.pendingRegistration.delete({
                            where: { id: pendingReg.id },
                        });
                        return {
                            success: false,
                            message: 'Registration link has expired. Please register again.',
                        };
                    }
                    await this.prisma.oTP.updateMany({
                        where: {
                            pendingRegistrationId: pendingReg.id,
                            type: resendOtpDto.type,
                            used: false,
                        },
                        data: {
                            used: true,
                            usedAt: new Date(),
                        },
                    });
                    const otpCode = (0, uuid_1.v4)();
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 24);
                    await this.prisma.oTP.create({
                        data: {
                            pendingRegistrationId: pendingReg.id,
                            code: otpCode,
                            type: resendOtpDto.type,
                            expiresAt,
                        },
                    });
                    try {
                        await this.emailService.sendVerificationEmail(pendingReg.email, otpCode, expiresAt, pendingReg.id);
                        this.logger.log(`Verification email resent to ${pendingReg.email}`);
                    }
                    catch (emailError) {
                        this.logger.error(`Failed to resend verification email: ${emailError.message}`);
                        throw new common_1.BadRequestException('Failed to send verification email. Please try again.');
                    }
                    return {
                        success: true,
                        message: 'A new verification code has been sent to your email.',
                    };
                }
            }
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
            const expiresAt = new Date();
            let otpCode;
            if (resendOtpDto.type === client_1.OTPType.PASSWORD_RESET) {
                otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                expiresAt.setMinutes(expiresAt.getMinutes() + 5);
            }
            else {
                otpCode = (0, uuid_1.v4)();
                if (resendOtpDto.type === client_1.OTPType.EMAIL_VERIFICATION) {
                    expiresAt.setHours(expiresAt.getHours() + 24);
                }
                else if (resendOtpDto.type === client_1.OTPType.PHONE_VERIFICATION) {
                    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
                }
                else {
                    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
                }
            }
            await this.prisma.oTP.create({
                data: {
                    userId: user.id,
                    code: otpCode,
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
            if (resendOtpDto.type === client_1.OTPType.PASSWORD_RESET) {
                await this.emailService.sendPasswordResetEmail(user.email, otpCode, expiresAt);
            }
            else if (resendOtpDto.type === client_1.OTPType.EMAIL_VERIFICATION) {
                await this.emailService.sendVerificationEmail(user.email, otpCode, expiresAt);
            }
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
    async googleAuth(googleAuthDto) {
        try {
            this.logger.log(`🔐 Google OAuth attempt for email: ${googleAuthDto.email}`);
            let user = await this.prisma.user.findUnique({
                where: { email: googleAuthDto.email },
                include: {
                    candidate: true,
                    admin: true,
                    superAdmin: true,
                    company: true,
                },
            });
            const nameParts = googleAuthDto.name.trim().split(' ');
            const firstName = nameParts[0] || googleAuthDto.name;
            const lastName = nameParts.slice(1).join(' ') || '';
            if (!user) {
                this.logger.log(`📝 Creating new user for Google OAuth: ${googleAuthDto.email}`);
                const randomPassword = await bcrypt.hash((0, uuid_1.v4)(), 10);
                const result = await this.prisma.$transaction(async (prisma) => {
                    const newUser = await prisma.user.create({
                        data: {
                            email: googleAuthDto.email,
                            password: randomPassword,
                            role: client_1.UserRole.CANDIDATE,
                            status: client_1.UserStatus.ACTIVE,
                            emailVerified: true,
                            phoneVerified: false,
                            profileCompleted: false,
                            twoFactorEnabled: false,
                        },
                    });
                    const candidate = await prisma.candidate.create({
                        data: {
                            userId: newUser.id,
                            firstName: firstName,
                            lastName: lastName,
                            profilePicture: googleAuthDto.picture || null,
                            isAvailable: true,
                        },
                    });
                    await prisma.userSetting.create({
                        data: {
                            userId: newUser.id,
                            key: 'googleId',
                            value: googleAuthDto.googleId,
                            category: 'oauth',
                        },
                    });
                    return { user: newUser, candidate };
                });
                user = await this.prisma.user.findUnique({
                    where: { id: result.user.id },
                    include: {
                        candidate: true,
                        admin: true,
                        superAdmin: true,
                        company: true,
                    },
                });
                if (!user) {
                    throw new common_1.BadRequestException('Failed to create user');
                }
                await this.prisma.activityLog.create({
                    data: {
                        userId: user.id,
                        action: 'CREATE',
                        level: 'INFO',
                        description: 'User registered via Google OAuth',
                        entity: 'User',
                        entityId: user.id,
                    },
                });
            }
            else {
                this.logger.log(`✅ User exists, logging in via Google OAuth: ${googleAuthDto.email}`);
                const existingGoogleId = await this.prisma.userSetting.findUnique({
                    where: {
                        userId_key: {
                            userId: user.id,
                            key: 'googleId',
                        },
                    },
                });
                if (!existingGoogleId) {
                    await this.prisma.userSetting.create({
                        data: {
                            userId: user.id,
                            key: 'googleId',
                            value: googleAuthDto.googleId,
                            category: 'oauth',
                        },
                    });
                }
                if (googleAuthDto.picture && user.candidate) {
                    await this.prisma.candidate.update({
                        where: { id: user.candidate.id },
                        data: { profilePicture: googleAuthDto.picture },
                    });
                }
                if (user.status === client_1.UserStatus.SUSPENDED) {
                    throw new common_1.UnauthorizedException('Account is suspended');
                }
                if (user.status === client_1.UserStatus.INACTIVE) {
                    await this.prisma.user.update({
                        where: { id: user.id },
                        data: { status: client_1.UserStatus.ACTIVE },
                    });
                    user.status = client_1.UserStatus.ACTIVE;
                }
            }
            if (!user) {
                throw new common_1.BadRequestException('User not found after authentication');
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
                    description: 'User logged in via Google OAuth',
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
                message: 'Google authentication successful',
                data: authResponse,
            };
        }
        catch (error) {
            this.logger.error(`❌ Google OAuth error: ${error.message}`, error.stack);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to authenticate with Google');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map