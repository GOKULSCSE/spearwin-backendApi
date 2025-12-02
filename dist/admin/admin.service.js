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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../database/database.service");
const pdf_extractor_service_1 = require("./services/pdf-extractor.service");
const company_uuid_util_1 = require("../company/utils/company-uuid.util");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    jwtService;
    pdfExtractor;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, jwtService, pdfExtractor) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.pdfExtractor = pdfExtractor;
    }
    async adminLogin(adminLoginDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: adminLoginDto.email },
                include: {
                    admin: true,
                    superAdmin: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid admin credentials');
            }
            if (user.role !== client_1.UserRole.ADMIN && user.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.UnauthorizedException('Access denied. Admin privileges required.');
            }
            const isPasswordValid = await bcrypt.compare(adminLoginDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid admin credentials');
            }
            if (user.status === client_1.UserStatus.SUSPENDED) {
                throw new common_1.UnauthorizedException('Admin account is suspended');
            }
            if (user.status === client_1.UserStatus.INACTIVE) {
                throw new common_1.UnauthorizedException('Admin account is inactive');
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
            };
            const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
            await this.prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN',
                    level: 'INFO',
                    description: 'Admin logged in successfully',
                    entity: 'Admin',
                    entityId: user.admin?.id || user.superAdmin?.id || user.id,
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
                    firstName: user.admin?.firstName || user.superAdmin?.firstName || '',
                    lastName: user.admin?.lastName || user.superAdmin?.lastName || '',
                    designation: user.admin?.designation || undefined,
                    department: user.admin?.department || undefined,
                    lastLoginAt: user.lastLoginAt,
                    createdAt: user.createdAt,
                },
            };
            return {
                success: true,
                message: 'Admin login successful',
                data: authResponse,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException('Admin login failed');
        }
    }
    async createAdmin(createAdminDto, currentUser) {
        try {
            if (currentUser && currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can create admins');
            }
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createAdminDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
            if (createAdminDto.phone) {
                const existingPhoneUser = await this.prisma.user.findUnique({
                    where: { phone: createAdminDto.phone },
                });
                if (existingPhoneUser) {
                    throw new common_1.BadRequestException('User with this phone number already exists');
                }
            }
            const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: createAdminDto.email,
                        password: hashedPassword,
                        phone: createAdminDto.phone,
                        role: createAdminDto.role,
                        status: client_1.UserStatus.ACTIVE,
                        emailVerified: true,
                        phoneVerified: createAdminDto.phone ? true : false,
                        profileCompleted: true,
                        twoFactorEnabled: false,
                    },
                });
                const adminData = {
                    userId: user.id,
                    permissions: [],
                };
                if (createAdminDto.firstName !== undefined)
                    adminData.firstName = createAdminDto.firstName;
                if (createAdminDto.lastName !== undefined)
                    adminData.lastName = createAdminDto.lastName;
                if (createAdminDto.department !== undefined)
                    adminData.department = createAdminDto.department;
                if (createAdminDto.designation !== undefined)
                    adminData.designation = createAdminDto.designation;
                if (createAdminDto.bio !== undefined)
                    adminData.bio = createAdminDto.bio;
                if (createAdminDto.profileImage !== undefined)
                    adminData.profileImage = createAdminDto.profileImage;
                if (createAdminDto.email !== undefined)
                    adminData.email = createAdminDto.email;
                if (createAdminDto.phone !== undefined)
                    adminData.phone = createAdminDto.phone;
                if (createAdminDto.country !== undefined)
                    adminData.country = createAdminDto.country;
                if (createAdminDto.state !== undefined)
                    adminData.state = createAdminDto.state;
                if (createAdminDto.city !== undefined)
                    adminData.city = createAdminDto.city;
                if (createAdminDto.streetAddress !== undefined)
                    adminData.streetAddress = createAdminDto.streetAddress;
                if (createAdminDto.linkedinUrl !== undefined)
                    adminData.linkedinUrl = createAdminDto.linkedinUrl;
                if (createAdminDto.facebookUrl !== undefined)
                    adminData.facebookUrl = createAdminDto.facebookUrl;
                if (createAdminDto.twitterUrl !== undefined)
                    adminData.twitterUrl = createAdminDto.twitterUrl;
                if (createAdminDto.instagramUrl !== undefined)
                    adminData.instagramUrl = createAdminDto.instagramUrl;
                const admin = await prisma.admin.create({
                    data: adminData,
                });
                return { user, admin };
            });
            if (currentUser) {
                await this.prisma.activityLog.create({
                    data: {
                        userId: currentUser.id,
                        action: 'CREATE',
                        level: 'INFO',
                        description: `Admin created: ${result.user.email}`,
                        entity: 'Admin',
                        entityId: result.admin.id,
                    },
                });
            }
            return {
                success: true,
                message: 'Admin created successfully',
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
                    admin: {
                        id: result.admin.id,
                        firstName: result.admin.firstName || '',
                        lastName: result.admin.lastName || '',
                        department: result.admin.department || undefined,
                        position: result.admin.designation || undefined,
                        createdAt: result.admin.createdAt,
                    },
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            console.error('Error creating admin:', error);
            throw new common_1.BadRequestException(error?.message || 'Failed to create admin. Please check all fields and try again.');
        }
    }
    async createCompany(createCompanyDto, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can create company profiles');
            }
            const companyEmail = `company-${(0, uuid_1.v4)()}@spearwin.com`;
            const hashedPassword = await bcrypt.hash((0, uuid_1.v4)(), 10);
            const slug = createCompanyDto.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') +
                '-' +
                Date.now();
            const existingCompanies = await this.prisma.company.findMany({
                select: { uuid: true, companyId: true },
            });
            const existingUuids = existingCompanies.map(c => c.uuid).filter((uuid) => uuid !== null);
            const companyUuid = (0, company_uuid_util_1.generateCompanyUuid)(createCompanyDto.name, existingUuids);
            const existingCompanyIds = existingCompanies.map(c => c.companyId).filter((id) => id !== null);
            const companyId = (0, company_uuid_util_1.generateCompanyId)(createCompanyDto.name, existingCompanyIds);
            const result = await this.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        email: companyEmail,
                        password: hashedPassword,
                        role: client_1.UserRole.COMPANY,
                        status: client_1.UserStatus.ACTIVE,
                        emailVerified: true,
                        phoneVerified: false,
                        profileCompleted: true,
                        twoFactorEnabled: false,
                    },
                });
                const company = await prisma.company.create({
                    data: {
                        userId: user.id,
                        name: createCompanyDto.name,
                        slug: slug,
                        uuid: companyUuid,
                        companyId: companyId,
                        description: createCompanyDto.description,
                        website: createCompanyDto.website,
                        industry: createCompanyDto.industry,
                        foundedYear: createCompanyDto.foundedYear,
                        employeeCount: createCompanyDto.employeeCount,
                        headquarters: createCompanyDto.headquarters,
                        address: createCompanyDto.address,
                        country: createCompanyDto.country,
                        state: createCompanyDto.state,
                        city: createCompanyDto.city,
                        linkedinUrl: createCompanyDto.linkedinUrl,
                        twitterUrl: createCompanyDto.twitterUrl,
                        facebookUrl: createCompanyDto.facebookUrl,
                        isVerified: createCompanyDto.isVerified ?? true,
                        isActive: createCompanyDto.isActive ?? true,
                    },
                });
                return { user, company };
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: currentUser.id,
                    action: 'CREATE',
                    level: 'INFO',
                    description: `Company profile created: ${result.company.name}`,
                    entity: 'Company',
                    entityId: result.company.id,
                },
            });
            return {
                success: true,
                message: 'Company profile created successfully',
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
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create company profile');
        }
    }
    async updatePermissions(updatePermissionsDto, currentUser) {
        try {
            if (currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can update admin permissions');
            }
            const admin = await this.prisma.admin.findUnique({
                where: { id: updatePermissionsDto.adminId },
                include: { user: true },
            });
            if (!admin) {
                throw new common_1.BadRequestException('Admin not found');
            }
            if (admin.user.role === client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.BadRequestException('Cannot modify SUPER_ADMIN permissions');
            }
            const updatedAdmin = await this.prisma.admin.update({
                where: { id: updatePermissionsDto.adminId },
                data: {
                    permissions: updatePermissionsDto.permissions ||
                        admin.permissions ||
                        [],
                },
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: currentUser.id,
                    action: 'UPDATE',
                    level: 'INFO',
                    description: `Admin permissions updated for: ${admin.user.email}`,
                    entity: 'Admin',
                    entityId: admin.id,
                },
            });
            return {
                success: true,
                message: 'Admin permissions updated successfully',
                data: {
                    admin: {
                        id: updatedAdmin.id,
                        permissions: Array.isArray(updatedAdmin.permissions)
                            ? updatedAdmin.permissions
                            : [],
                        updatedAt: updatedAdmin.updatedAt,
                    },
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update admin permissions');
        }
    }
    async getAdminProfile(userId) {
        try {
            const admin = await this.prisma.admin.findFirst({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            emailVerified: true,
                            phone: true,
                            phoneVerified: true,
                            role: true,
                            status: true,
                            profileCompleted: true,
                            twoFactorEnabled: true,
                            lastLoginAt: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin profile not found');
            }
            return {
                id: admin.id,
                userId: admin.userId,
                firstName: admin.firstName || undefined,
                lastName: admin.lastName || undefined,
                email: admin.email || admin.user.email,
                phone: admin.phone || admin.user.phone || undefined,
                bio: admin.bio || undefined,
                profileImage: admin.profileImage || undefined,
                department: admin.department || undefined,
                designation: admin.designation || undefined,
                country: admin.country || undefined,
                state: admin.state || undefined,
                city: admin.city || undefined,
                streetAddress: admin.streetAddress || undefined,
                linkedinUrl: admin.linkedinUrl || undefined,
                facebookUrl: admin.facebookUrl || undefined,
                twitterUrl: admin.twitterUrl || undefined,
                instagramUrl: admin.instagramUrl || undefined,
                permissions: admin.permissions,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                user: {
                    id: admin.user.id,
                    email: admin.user.email,
                    emailVerified: admin.user.emailVerified,
                    phone: admin.user.phone,
                    phoneVerified: admin.user.phoneVerified,
                    role: admin.user.role,
                    status: admin.user.status,
                    profileCompleted: admin.user.profileCompleted,
                    twoFactorEnabled: admin.user.twoFactorEnabled,
                    lastLoginAt: admin.user.lastLoginAt,
                    createdAt: admin.user.createdAt,
                    updatedAt: admin.user.updatedAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get admin profile');
        }
    }
    async updateAdminProfile(userId, updateDto) {
        try {
            const admin = await this.prisma.admin.findFirst({
                where: { userId },
                include: { user: true },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin profile not found');
            }
            if (updateDto.email && updateDto.email !== admin.user.email) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: updateDto.email },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Email is already in use');
                }
            }
            if (updateDto.phone && updateDto.phone !== admin.user.phone) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { phone: updateDto.phone },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
            }
            const result = await this.prisma.$transaction(async (prisma) => {
                const userUpdateData = {};
                if (updateDto.email)
                    userUpdateData.email = updateDto.email;
                if (updateDto.phone)
                    userUpdateData.phone = updateDto.phone;
                if (Object.keys(userUpdateData).length > 0) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            ...userUpdateData,
                            emailVerified: updateDto.email && updateDto.email !== admin.user.email
                                ? false
                                : admin.user.emailVerified,
                            phoneVerified: updateDto.phone && updateDto.phone !== admin.user.phone
                                ? false
                                : admin.user.phoneVerified,
                        },
                    });
                }
                const adminUpdateData = {};
                if (updateDto.firstName !== undefined)
                    adminUpdateData.firstName = updateDto.firstName;
                if (updateDto.lastName !== undefined)
                    adminUpdateData.lastName = updateDto.lastName;
                if (updateDto.bio !== undefined)
                    adminUpdateData.bio = updateDto.bio;
                if (updateDto.profileImage !== undefined)
                    adminUpdateData.profileImage = updateDto.profileImage;
                if (updateDto.email !== undefined)
                    adminUpdateData.email = updateDto.email;
                if (updateDto.phone !== undefined)
                    adminUpdateData.phone = updateDto.phone;
                if (updateDto.department !== undefined)
                    adminUpdateData.department = updateDto.department;
                if (updateDto.designation !== undefined)
                    adminUpdateData.designation = updateDto.designation;
                if (updateDto.country !== undefined)
                    adminUpdateData.country = updateDto.country;
                if (updateDto.state !== undefined)
                    adminUpdateData.state = updateDto.state;
                if (updateDto.city !== undefined)
                    adminUpdateData.city = updateDto.city;
                if (updateDto.streetAddress !== undefined)
                    adminUpdateData.streetAddress = updateDto.streetAddress;
                if (updateDto.linkedinUrl !== undefined)
                    adminUpdateData.linkedinUrl = updateDto.linkedinUrl;
                if (updateDto.facebookUrl !== undefined)
                    adminUpdateData.facebookUrl = updateDto.facebookUrl;
                if (updateDto.twitterUrl !== undefined)
                    adminUpdateData.twitterUrl = updateDto.twitterUrl;
                if (updateDto.instagramUrl !== undefined)
                    adminUpdateData.instagramUrl = updateDto.instagramUrl;
                if (Object.keys(adminUpdateData).length > 0) {
                    await prisma.admin.update({
                        where: { id: admin.id },
                        data: adminUpdateData,
                    });
                }
                const updatedAdmin = await prisma.admin.findUnique({
                    where: { id: admin.id },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                emailVerified: true,
                                phone: true,
                                phoneVerified: true,
                                role: true,
                                status: true,
                                profileCompleted: true,
                                twoFactorEnabled: true,
                                lastLoginAt: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },
                    },
                });
                if (!updatedAdmin) {
                    throw new common_1.BadRequestException('Failed to retrieve updated admin profile');
                }
                return updatedAdmin;
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Admin', admin.id, 'Admin profile updated');
            return {
                id: result.id,
                userId: result.userId,
                firstName: result.firstName ?? undefined,
                lastName: result.lastName ?? undefined,
                department: result.department ?? undefined,
                designation: result.designation ?? undefined,
                permissions: result.permissions,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    emailVerified: result.user.emailVerified,
                    phone: result.user.phone,
                    phoneVerified: result.user.phoneVerified,
                    role: result.user.role,
                    status: result.user.status,
                    profileCompleted: result.user.profileCompleted,
                    twoFactorEnabled: result.user.twoFactorEnabled,
                    lastLoginAt: result.user.lastLoginAt,
                    createdAt: result.user.createdAt,
                    updatedAt: result.user.updatedAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update admin profile');
        }
    }
    async updateAdminProfileById(adminId, updateDto) {
        try {
            const admin = await this.prisma.admin.findUnique({
                where: { id: adminId },
                include: { user: true },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin not found');
            }
            if (updateDto.email && updateDto.email !== admin.user.email) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: updateDto.email },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Email is already in use');
                }
            }
            if (updateDto.phone && updateDto.phone !== admin.user.phone) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { phone: updateDto.phone },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
            }
            const result = await this.prisma.$transaction(async (prisma) => {
                const userUpdateData = {};
                if (updateDto.email)
                    userUpdateData.email = updateDto.email;
                if (updateDto.phone)
                    userUpdateData.phone = updateDto.phone;
                if (Object.keys(userUpdateData).length > 0) {
                    await prisma.user.update({
                        where: { id: admin.userId },
                        data: {
                            ...userUpdateData,
                            emailVerified: updateDto.email && updateDto.email !== admin.user.email
                                ? false
                                : admin.user.emailVerified,
                            phoneVerified: updateDto.phone && updateDto.phone !== admin.user.phone
                                ? false
                                : admin.user.phoneVerified,
                        },
                    });
                }
                const adminUpdateData = {};
                if (updateDto.firstName)
                    adminUpdateData.firstName = updateDto.firstName;
                if (updateDto.lastName)
                    adminUpdateData.lastName = updateDto.lastName;
                if (updateDto.department)
                    adminUpdateData.department = updateDto.department;
                if (updateDto.designation)
                    adminUpdateData.designation = updateDto.designation;
                if (Object.keys(adminUpdateData).length > 0) {
                    await prisma.admin.update({
                        where: { id: adminId },
                        data: adminUpdateData,
                    });
                }
                const updatedAdmin = await prisma.admin.findUnique({
                    where: { id: adminId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                emailVerified: true,
                                phone: true,
                                phoneVerified: true,
                                role: true,
                                status: true,
                                profileCompleted: true,
                                twoFactorEnabled: true,
                                lastLoginAt: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },
                    },
                });
                if (!updatedAdmin) {
                    throw new common_1.BadRequestException('Failed to retrieve updated admin profile');
                }
                return updatedAdmin;
            });
            return {
                id: result.id,
                userId: result.userId,
                firstName: result.firstName ?? undefined,
                lastName: result.lastName ?? undefined,
                department: result.department ?? undefined,
                designation: result.designation ?? undefined,
                permissions: result.permissions,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    emailVerified: result.user.emailVerified,
                    phone: result.user.phone,
                    phoneVerified: result.user.phoneVerified,
                    role: result.user.role,
                    status: result.user.status,
                    profileCompleted: result.user.profileCompleted,
                    twoFactorEnabled: result.user.twoFactorEnabled,
                    lastLoginAt: result.user.lastLoginAt,
                    createdAt: result.user.createdAt,
                    updatedAt: result.user.updatedAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update admin profile');
        }
    }
    async changeAdminPassword(adminId, changePasswordDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: adminId },
            });
            if (!user) {
                throw new common_1.NotFoundException('Admin not found');
            }
            const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new common_1.UnauthorizedException('Current password is incorrect');
            }
            const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);
            await this.prisma.user.update({
                where: { id: adminId },
                data: { password: hashedNewPassword },
            });
            await this.logActivity(adminId, 'UPDATE', 'INFO', 'Admin', adminId, 'Admin password changed');
            return { message: 'Password changed successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to change password');
        }
    }
    async getAllAdmins(query) {
        try {
            const { search, department, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const where = {
                user: {
                    role: {
                        in: [client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN],
                    },
                },
            };
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { department: { contains: search, mode: 'insensitive' } },
                    { designation: { contains: search, mode: 'insensitive' } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ];
            }
            if (department) {
                where.department = department;
            }
            if (role) {
                where.user = { ...where.user, role: role };
            }
            if (status) {
                where.user = { ...where.user, status: status };
            }
            const orderBy = {};
            const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
            if (sortBy === 'firstName' ||
                sortBy === 'lastName' ||
                sortBy === 'department' ||
                sortBy === 'designation') {
                orderBy[sortBy] =
                    sortDirection;
            }
            else {
                orderBy.user = {
                    [sortBy]: sortDirection,
                };
            }
            const [admins, total] = await Promise.all([
                this.prisma.admin.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                emailVerified: true,
                                phone: true,
                                phoneVerified: true,
                                role: true,
                                status: true,
                                profileCompleted: true,
                                twoFactorEnabled: true,
                                lastLoginAt: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                        },
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.admin.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                admins: admins.map((admin) => ({
                    id: admin.id,
                    userId: admin.userId,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    department: admin.department,
                    designation: admin.designation,
                    permissions: admin.permissions,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt,
                    user: {
                        id: admin.user.id,
                        email: admin.user.email,
                        emailVerified: admin.user.emailVerified,
                        phone: admin.user.phone,
                        phoneVerified: admin.user.phoneVerified,
                        role: admin.user.role,
                        status: admin.user.status,
                        profileCompleted: admin.user.profileCompleted,
                        twoFactorEnabled: admin.user.twoFactorEnabled,
                        lastLoginAt: admin.user.lastLoginAt,
                        createdAt: admin.user.createdAt,
                        updatedAt: admin.user.updatedAt,
                    },
                })),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to get admins list');
        }
    }
    async getAdminById(adminId) {
        try {
            const admin = await this.prisma.admin.findUnique({
                where: { id: adminId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            emailVerified: true,
                            phone: true,
                            phoneVerified: true,
                            role: true,
                            status: true,
                            profileCompleted: true,
                            twoFactorEnabled: true,
                            lastLoginAt: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin not found');
            }
            return {
                id: admin.id,
                userId: admin.userId,
                firstName: admin.firstName || undefined,
                lastName: admin.lastName || undefined,
                email: admin.email || admin.user.email,
                phone: admin.phone || admin.user.phone || undefined,
                bio: admin.bio || undefined,
                profileImage: admin.profileImage || undefined,
                department: admin.department || undefined,
                designation: admin.designation || undefined,
                country: admin.country || undefined,
                state: admin.state || undefined,
                city: admin.city || undefined,
                streetAddress: admin.streetAddress || undefined,
                linkedinUrl: admin.linkedinUrl || undefined,
                facebookUrl: admin.facebookUrl || undefined,
                twitterUrl: admin.twitterUrl || undefined,
                instagramUrl: admin.instagramUrl || undefined,
                permissions: admin.permissions,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                user: {
                    id: admin.user.id,
                    email: admin.user.email,
                    emailVerified: admin.user.emailVerified,
                    phone: admin.user.phone,
                    phoneVerified: admin.user.phoneVerified,
                    role: admin.user.role,
                    status: admin.user.status,
                    profileCompleted: admin.user.profileCompleted,
                    twoFactorEnabled: admin.user.twoFactorEnabled,
                    lastLoginAt: admin.user.lastLoginAt,
                    createdAt: admin.user.createdAt,
                    updatedAt: admin.user.updatedAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get admin details');
        }
    }
    async updateAdminStatus(adminId, statusDto, currentUserId) {
        try {
            const currentUser = await this.prisma.user.findUnique({
                where: { id: currentUserId },
            });
            if (currentUser?.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can update admin status');
            }
            const admin = await this.prisma.admin.findUnique({
                where: { id: adminId },
                include: { user: true },
            });
            if (!admin) {
                throw new common_1.NotFoundException('Admin not found');
            }
            if (admin.user.role === client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.BadRequestException('Cannot modify SUPER_ADMIN status');
            }
            await this.prisma.user.update({
                where: { id: admin.userId },
                data: { status: statusDto.status },
            });
            await this.logActivity(currentUserId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Admin', adminId, `Admin status updated to ${statusDto.status}: ${admin.user.email}`);
            return {
                message: `Admin status updated to ${statusDto.status} successfully`,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update admin status');
        }
    }
    async updateUserProfile(userId, updateDto, currentUserId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    candidate: {
                        include: {
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    admin: true,
                    superAdmin: true,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (updateDto.email && updateDto.email !== user.email) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: updateDto.email },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Email is already in use');
                }
            }
            if (updateDto.phone && updateDto.phone !== user.phone) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { phone: updateDto.phone },
                });
                if (existingUser) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
            }
            const result = await this.prisma.$transaction(async (prisma) => {
                const userUpdateData = {};
                if (updateDto.email !== undefined)
                    userUpdateData.email = updateDto.email;
                if (updateDto.phone !== undefined)
                    userUpdateData.phone = updateDto.phone;
                if (Object.keys(userUpdateData).length > 0) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            ...userUpdateData,
                            emailVerified: updateDto.email && updateDto.email !== user.email
                                ? false
                                : user.emailVerified,
                            phoneVerified: updateDto.phone && updateDto.phone !== user.phone
                                ? false
                                : user.phoneVerified,
                        },
                    });
                }
                if (user.candidate) {
                    const candidateUpdateData = {};
                    if (updateDto.firstName !== undefined && updateDto.firstName !== null)
                        candidateUpdateData.firstName = updateDto.firstName;
                    if (updateDto.lastName !== undefined && updateDto.lastName !== null)
                        candidateUpdateData.lastName = updateDto.lastName;
                    if (updateDto.bio !== undefined && updateDto.bio !== null)
                        candidateUpdateData.bio = updateDto.bio;
                    if (updateDto.profileImage !== undefined && updateDto.profileImage !== null)
                        candidateUpdateData.profilePicture = updateDto.profileImage;
                    if (updateDto.linkedinUrl !== undefined && updateDto.linkedinUrl !== null)
                        candidateUpdateData.linkedinUrl = updateDto.linkedinUrl || null;
                    if (updateDto.facebookUrl !== undefined && updateDto.facebookUrl !== null)
                        candidateUpdateData.facebookUrl = updateDto.facebookUrl || null;
                    if (updateDto.twitterUrl !== undefined && updateDto.twitterUrl !== null)
                        candidateUpdateData.twitterUrl = updateDto.twitterUrl || null;
                    if (updateDto.instagramUrl !== undefined && updateDto.instagramUrl !== null)
                        candidateUpdateData.instagramUrl = updateDto.instagramUrl || null;
                    if (updateDto.country !== undefined && updateDto.country !== null)
                        candidateUpdateData.country = updateDto.country || null;
                    if (updateDto.state !== undefined && updateDto.state !== null)
                        candidateUpdateData.state = updateDto.state || null;
                    if (updateDto.cityName !== undefined && updateDto.cityName !== null)
                        candidateUpdateData.cityName = updateDto.cityName || null;
                    if (updateDto.address !== undefined && updateDto.address !== null)
                        candidateUpdateData.address = updateDto.address || null;
                    if (updateDto.streetAddress !== undefined && updateDto.streetAddress !== null)
                        candidateUpdateData.streetAddress = updateDto.streetAddress || null;
                    if (updateDto.cityId !== undefined && updateDto.cityId !== null)
                        candidateUpdateData.cityId = updateDto.cityId;
                    if (Object.keys(candidateUpdateData).length > 0) {
                        await prisma.candidate.update({
                            where: { id: user.candidate.id },
                            data: candidateUpdateData,
                        });
                    }
                }
                if (user.admin) {
                    const adminUpdateData = {};
                    if (updateDto.firstName !== undefined)
                        adminUpdateData.firstName = updateDto.firstName;
                    if (updateDto.lastName !== undefined)
                        adminUpdateData.lastName = updateDto.lastName;
                    if (updateDto.bio !== undefined)
                        adminUpdateData.bio = updateDto.bio;
                    if (updateDto.profileImage !== undefined)
                        adminUpdateData.profileImage = updateDto.profileImage;
                    if (updateDto.email !== undefined)
                        adminUpdateData.email = updateDto.email;
                    if (updateDto.phone !== undefined)
                        adminUpdateData.phone = updateDto.phone;
                    if (updateDto.linkedinUrl !== undefined)
                        adminUpdateData.linkedinUrl = updateDto.linkedinUrl || null;
                    if (updateDto.facebookUrl !== undefined)
                        adminUpdateData.facebookUrl = updateDto.facebookUrl || null;
                    if (updateDto.twitterUrl !== undefined)
                        adminUpdateData.twitterUrl = updateDto.twitterUrl || null;
                    if (updateDto.instagramUrl !== undefined)
                        adminUpdateData.instagramUrl = updateDto.instagramUrl || null;
                    if (updateDto.country !== undefined)
                        adminUpdateData.country = updateDto.country || null;
                    if (updateDto.state !== undefined)
                        adminUpdateData.state = updateDto.state || null;
                    if (updateDto.cityName !== undefined)
                        adminUpdateData.city = updateDto.cityName || null;
                    if (updateDto.streetAddress !== undefined)
                        adminUpdateData.streetAddress = updateDto.streetAddress || null;
                    if (Object.keys(adminUpdateData).length > 0) {
                        await prisma.admin.update({
                            where: { id: user.admin.id },
                            data: adminUpdateData,
                        });
                    }
                }
                if (user.superAdmin) {
                    const superAdminUpdateData = {};
                    if (updateDto.firstName !== undefined)
                        superAdminUpdateData.firstName = updateDto.firstName;
                    if (updateDto.lastName !== undefined)
                        superAdminUpdateData.lastName = updateDto.lastName;
                    if (updateDto.bio !== undefined)
                        superAdminUpdateData.bio = updateDto.bio;
                    if (updateDto.profileImage !== undefined)
                        superAdminUpdateData.profileImage = updateDto.profileImage;
                    if (updateDto.email !== undefined)
                        superAdminUpdateData.email = updateDto.email;
                    if (updateDto.phone !== undefined)
                        superAdminUpdateData.phone = updateDto.phone;
                    if (updateDto.linkedinUrl !== undefined)
                        superAdminUpdateData.linkedinUrl = updateDto.linkedinUrl || null;
                    if (updateDto.facebookUrl !== undefined)
                        superAdminUpdateData.facebookUrl = updateDto.facebookUrl || null;
                    if (updateDto.twitterUrl !== undefined)
                        superAdminUpdateData.twitterUrl = updateDto.twitterUrl || null;
                    if (updateDto.instagramUrl !== undefined)
                        superAdminUpdateData.instagramUrl = updateDto.instagramUrl || null;
                    if (updateDto.country !== undefined)
                        superAdminUpdateData.country = updateDto.country || null;
                    if (updateDto.state !== undefined)
                        superAdminUpdateData.state = updateDto.state || null;
                    if (updateDto.cityName !== undefined)
                        superAdminUpdateData.city = updateDto.cityName || null;
                    if (updateDto.streetAddress !== undefined)
                        superAdminUpdateData.streetAddress = updateDto.streetAddress || null;
                    if (Object.keys(superAdminUpdateData).length > 0) {
                        await prisma.superAdmin.update({
                            where: { id: user.superAdmin.id },
                            data: superAdminUpdateData,
                        });
                    }
                }
                return await prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        candidate: {
                            include: {
                                city: {
                                    include: {
                                        state: {
                                            include: {
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        admin: true,
                        superAdmin: true,
                    },
                });
            });
            await this.logActivity(currentUserId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'User', userId, `User profile updated: ${user.email}`);
            return {
                message: 'User profile updated successfully',
                user: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update user profile');
        }
    }
    async getAllJobs(query, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can access job management');
            }
            const { search, company, city, type, experience, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { requirements: { contains: search, mode: 'insensitive' } },
                    { responsibilities: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (company)
                where.companyId = company;
            if (city)
                where.cityId = parseInt(city);
            if (type)
                where.jobType = type;
            if (experience)
                where.experienceLevel = experience;
            if (status)
                where.status = status;
            const orderBy = {};
            if (sortBy === 'title') {
                orderBy.title = sortOrder;
            }
            else if (sortBy === 'salaryMin') {
                orderBy.minSalary = sortOrder;
            }
            else if (sortBy === 'publishedAt') {
                orderBy.publishedAt = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [jobs, total] = await Promise.all([
                this.prisma.job.findMany({
                    where,
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                uuid: true,
                                companyId: true,
                                logo: true,
                                industry: true,
                                employeeCount: true,
                                website: true,
                            },
                        },
                        postedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                designation: true,
                                department: true,
                            },
                        },
                        city: {
                            include: {
                                state: {
                                    include: {
                                        country: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.job.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                jobs: jobs.map((job) => this.mapJobToResponse(job)),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get jobs list');
        }
    }
    async createJob(createJobDto, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can create jobs');
            }
            console.log('createJobDto', createJobDto);
            let admin = await this.prisma.admin.findUnique({
                where: { userId: currentUser.id },
                select: { id: true, firstName: true, lastName: true }
            });
            if (!admin) {
                const user = await this.prisma.user.findUnique({
                    where: { id: currentUser.id },
                    select: { email: true, phone: true }
                });
                admin = await this.prisma.admin.create({
                    data: {
                        userId: currentUser.id,
                        email: user?.email,
                        phone: user?.phone,
                        permissions: [],
                    },
                    select: { id: true, firstName: true, lastName: true }
                });
            }
            const company = await this.prisma.company.findUnique({
                where: {
                    id: createJobDto.companyId,
                    isActive: true
                },
                select: { id: true, name: true, isActive: true }
            });
            if (!company) {
                throw new common_1.BadRequestException(`Company with ID "${createJobDto.companyId}" not found or is not active`);
            }
            if (createJobDto.cityId) {
                const city = await this.prisma.city.findUnique({
                    where: { id: parseInt(createJobDto.cityId) },
                    select: { id: true, name: true, isActive: true }
                });
                if (!city) {
                    throw new common_1.BadRequestException(`City with ID ${createJobDto.cityId} not found`);
                }
                if (!city.isActive) {
                    throw new common_1.BadRequestException(`City ${city.name} is not active`);
                }
            }
            const slug = createJobDto.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') +
                '-' +
                Date.now();
            const job = await this.prisma.job.create({
                data: {
                    title: createJobDto.title,
                    slug,
                    description: createJobDto.description,
                    requirements: createJobDto.requirements,
                    responsibilities: createJobDto.responsibilities,
                    benefits: createJobDto.benefits,
                    companyId: company.id,
                    postedById: admin.id,
                    cityId: createJobDto.cityId ? parseInt(createJobDto.cityId) : null,
                    address: createJobDto.address,
                    jobType: createJobDto.jobType,
                    workMode: createJobDto.workMode,
                    experienceLevel: createJobDto.experienceLevel,
                    minExperience: createJobDto.minExperience,
                    maxExperience: createJobDto.maxExperience,
                    minSalary: createJobDto.minSalary,
                    maxSalary: createJobDto.maxSalary,
                    salaryNegotiable: createJobDto.salaryNegotiable || false,
                    skillsRequired: createJobDto.skillsRequired || [],
                    educationLevel: createJobDto.educationLevel,
                    expiresAt: createJobDto.expiresAt
                        ? new Date(createJobDto.expiresAt)
                        : null,
                    status: createJobDto.status || 'DRAFT',
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            companyId: true,
                            logo: true,
                            industry: true,
                            employeeCount: true,
                            website: true,
                        },
                    },
                    postedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            designation: true,
                            department: true,
                        },
                    },
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Job', job.id, `Job created: ${job.title}`);
            return {
                success: true,
                message: 'Job created successfully',
                data: this.mapJobToResponse(job),
            };
        }
        catch (error) {
            console.log('error', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.code === 'P2003') {
                if (error.meta?.constraint === 'jobs_companyId_fkey') {
                    throw new common_1.BadRequestException('Invalid company ID provided');
                }
                if (error.meta?.constraint === 'jobs_cityId_fkey') {
                    throw new common_1.BadRequestException('Invalid city ID provided');
                }
                if (error.meta?.constraint === 'jobs_postedById_fkey') {
                    throw new common_1.BadRequestException('Invalid user ID for job posting');
                }
            }
            if (error.code === 'P2002') {
                if (error.meta?.target?.includes('slug')) {
                    throw new common_1.BadRequestException('A job with this title already exists');
                }
            }
            throw new common_1.BadRequestException(`Failed to create job: ${error.message || 'Unknown error'}`);
        }
    }
    async getJobById(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can access job details');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            industry: true,
                            employeeCount: true,
                            website: true,
                        },
                    },
                    postedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            designation: true,
                            department: true,
                        },
                    },
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            return this.mapJobToResponse(job);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get job details');
        }
    }
    async updateJob(jobId, updateJobDto, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can update jobs');
            }
            const existingJob = await this.prisma.job.findUnique({
                where: { id: jobId },
            });
            if (!existingJob) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updateData = {};
            if (updateJobDto.title !== undefined)
                updateData.title = updateJobDto.title;
            if (updateJobDto.description !== undefined)
                updateData.description = updateJobDto.description;
            if (updateJobDto.requirements !== undefined)
                updateData.requirements = updateJobDto.requirements;
            if (updateJobDto.responsibilities !== undefined)
                updateData.responsibilities = updateJobDto.responsibilities;
            if (updateJobDto.benefits !== undefined)
                updateData.benefits = updateJobDto.benefits;
            if (updateJobDto.companyId !== undefined)
                updateData.companyId = updateJobDto.companyId;
            if (updateJobDto.cityId !== undefined)
                updateData.cityId = updateJobDto.cityId;
            if (updateJobDto.address !== undefined)
                updateData.address = updateJobDto.address;
            if (updateJobDto.jobType !== undefined)
                updateData.jobType = updateJobDto.jobType;
            if (updateJobDto.workMode !== undefined)
                updateData.workMode = updateJobDto.workMode;
            if (updateJobDto.experienceLevel !== undefined)
                updateData.experienceLevel = updateJobDto.experienceLevel;
            if (updateJobDto.minExperience !== undefined)
                updateData.minExperience = updateJobDto.minExperience;
            if (updateJobDto.maxExperience !== undefined)
                updateData.maxExperience = updateJobDto.maxExperience;
            if (updateJobDto.minSalary !== undefined)
                updateData.minSalary = updateJobDto.minSalary;
            if (updateJobDto.maxSalary !== undefined)
                updateData.maxSalary = updateJobDto.maxSalary;
            if (updateJobDto.salaryNegotiable !== undefined)
                updateData.salaryNegotiable = updateJobDto.salaryNegotiable;
            if (updateJobDto.skillsRequired !== undefined)
                updateData.skillsRequired = updateJobDto.skillsRequired;
            if (updateJobDto.educationLevel !== undefined)
                updateData.educationLevel = updateJobDto.educationLevel;
            if (updateJobDto.expiresAt !== undefined) {
                updateData.expiresAt = updateJobDto.expiresAt
                    ? new Date(updateJobDto.expiresAt)
                    : null;
            }
            if (updateJobDto.status !== undefined)
                updateData.status = updateJobDto.status;
            const updatedJob = await this.prisma.job.update({
                where: { id: jobId },
                data: updateData,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                            industry: true,
                            employeeCount: true,
                            website: true,
                        },
                    },
                    postedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            designation: true,
                            department: true,
                        },
                    },
                    city: {
                        include: {
                            state: {
                                include: {
                                    country: true,
                                },
                            },
                        },
                    },
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Job', jobId, `Job updated: ${updatedJob.title}`);
            return {
                success: true,
                message: 'Job updated successfully',
                data: this.mapJobToResponse(updatedJob),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update job');
        }
    }
    async deleteJob(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can delete jobs');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            await this.prisma.job.delete({
                where: { id: jobId },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'Job', jobId, `Job deleted: ${job.title}`);
            return {
                success: true,
                message: 'Job deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete job');
        }
    }
    async publishJob(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can publish jobs');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true, status: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updatedJob = await this.prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Job', jobId, `Job published: ${job.title}`);
            return {
                success: true,
                message: 'Job published successfully',
                data: {
                    status: updatedJob.status,
                    publishedAt: updatedJob.publishedAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to publish job');
        }
    }
    async closeJob(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can close jobs');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true, status: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updatedJob = await this.prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'CLOSED',
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Job', jobId, `Job closed: ${job.title}`);
            return {
                success: true,
                message: 'Job closed successfully',
                data: { status: updatedJob.status },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to close job');
        }
    }
    async archiveJob(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can archive jobs');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true, status: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updatedJob = await this.prisma.job.update({
                where: { id: jobId },
                data: {
                    status: 'ARCHIVED',
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Job', jobId, `Job archived: ${job.title}`);
            return {
                success: true,
                message: 'Job archived successfully',
                data: { status: updatedJob.status },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to archive job');
        }
    }
    async updateJobStatus(jobId, status, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can update job status');
            }
            const validStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];
            if (!validStatuses.includes(status)) {
                throw new common_1.BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true, status: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updatedJob = await this.prisma.job.update({
                where: { id: jobId },
                data: {
                    status: status,
                    ...(status === 'PUBLISHED' && !job.status ? { publishedAt: new Date() } : {}),
                    ...(status === 'CLOSED' ? { closedAt: new Date() } : {}),
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logo: true,
                        },
                    },
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Job', jobId, `Job status updated from ${job.status} to ${status}: ${job.title}`);
            return {
                success: true,
                message: `Job status updated to ${status} successfully`,
                data: updatedJob,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update job status');
        }
    }
    async getJobApplications(jobId, query, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can access job applications');
            }
            const { page = 1, limit = 20 } = query;
            const skip = (page - 1) * limit;
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const [applications, total] = await Promise.all([
                this.prisma.jobApplication.findMany({
                    where: { jobId },
                    include: {
                        candidate: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.jobApplication.count({ where: { jobId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                applications: applications.map((app) => ({
                    id: app.id,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    coverLetter: app.coverLetter,
                    resumeId: app.resumeId,
                    reviewedAt: app.reviewedAt,
                    reviewedBy: app.reviewedBy,
                    feedback: app.feedback,
                    candidate: {
                        id: app.candidate.id,
                        firstName: app.candidate.firstName,
                        lastName: app.candidate.lastName,
                        email: app.candidate.user.email,
                        phone: app.candidate.user.phone,
                    },
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get job applications');
        }
    }
    async getJobStats(jobId, currentUser) {
        try {
            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN].includes(currentUser.role)) {
                throw new common_1.ForbiddenException('Only admins can access job statistics');
            }
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const [totalJobs, publishedJobs, draftJobs, closedJobs, totalApplications, totalViews, jobApplications, jobViews, recentApplications, recentViews,] = await Promise.all([
                this.prisma.job.count(),
                this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
                this.prisma.job.count({ where: { status: 'DRAFT' } }),
                this.prisma.job.count({ where: { status: 'CLOSED' } }),
                this.prisma.jobApplication.count(),
                this.prisma.job.aggregate({ _sum: { viewCount: true } }),
                this.prisma.jobApplication.count({ where: { jobId } }),
                this.prisma.job.findUnique({
                    where: { id: jobId },
                    select: { viewCount: true },
                }),
                this.prisma.jobApplication.count({
                    where: {
                        jobId,
                        appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    },
                }),
                0,
            ]);
            const totalViewsCount = totalViews._sum.viewCount || 0;
            const jobViewsCount = jobViews?.viewCount || 0;
            return {
                totalJobs,
                publishedJobs,
                draftJobs,
                closedJobs,
                totalApplications,
                totalViews: totalViewsCount,
                averageApplicationsPerJob: totalJobs > 0 ? totalApplications / totalJobs : 0,
                averageViewsPerJob: totalJobs > 0 ? totalViewsCount / totalJobs : 0,
                recentApplications,
                recentViews,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to get job statistics');
        }
    }
    mapJobToResponse(job) {
        return {
            id: job.id,
            title: job.title,
            slug: job.slug,
            description: job.description,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            benefits: job.benefits,
            companyId: job.company?.companyId || job.companyId,
            postedById: job.postedById,
            cityId: job.cityId,
            address: job.address,
            jobType: job.jobType,
            workMode: job.workMode,
            experienceLevel: job.experienceLevel,
            minExperience: job.minExperience,
            maxExperience: job.maxExperience,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            salaryNegotiable: job.salaryNegotiable,
            skillsRequired: job.skillsRequired || [],
            educationLevel: job.educationLevel,
            applicationCount: job.applicationCount,
            viewCount: job.viewCount,
            status: job.status,
            expiresAt: job.expiresAt,
            publishedAt: job.publishedAt,
            closedAt: job.closedAt,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            company: job.company,
            postedBy: job.postedBy,
            location: job.city
                ? {
                    city: {
                        id: job.city.id,
                        name: job.city.name,
                        state: {
                            id: job.city.state.id,
                            name: job.city.state.name,
                            code: job.city.state.code,
                            country: {
                                id: job.city.state.country.id,
                                name: job.city.state.country.name,
                                code: job.city.state.country.code,
                            },
                        },
                    },
                }
                : null,
        };
    }
    async getAllApplications(query, currentUser) {
        try {
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const whereClause = {};
            if (query.status) {
                whereClause.status = query.status;
            }
            if (query.jobTitle || query.companyName) {
                whereClause.job = {};
                if (query.jobTitle) {
                    whereClause.job.title = {
                        contains: query.jobTitle,
                        mode: 'insensitive',
                    };
                }
                if (query.companyName) {
                    whereClause.job.company = {
                        name: { contains: query.companyName, mode: 'insensitive' },
                    };
                }
            }
            if (query.candidateName) {
                whereClause.candidate = {
                    OR: [
                        {
                            firstName: { contains: query.candidateName, mode: 'insensitive' },
                        },
                        {
                            lastName: { contains: query.candidateName, mode: 'insensitive' },
                        },
                        {
                            user: {
                                email: { contains: query.candidateName, mode: 'insensitive' },
                            },
                        },
                    ],
                };
            }
            if (query.appliedFrom || query.appliedTo) {
                whereClause.appliedAt = {};
                if (query.appliedFrom) {
                    whereClause.appliedAt.gte = new Date(query.appliedFrom);
                }
                if (query.appliedTo) {
                    whereClause.appliedAt.lte = new Date(query.appliedTo);
                }
            }
            const [applications, total] = await Promise.all([
                this.prisma.jobApplication.findMany({
                    where: whereClause,
                    include: {
                        job: {
                            include: {
                                company: {
                                    select: {
                                        id: true,
                                        name: true,
                                        companyId: true,
                                        logo: true,
                                    },
                                },
                                city: {
                                    include: {
                                        state: {
                                            include: {
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        candidate: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        phone: true,
                                        status: true,
                                    },
                                },
                                city: {
                                    include: {
                                        state: {
                                            include: {
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        resume: {
                            select: {
                                id: true,
                                title: true,
                                fileName: true,
                                filePath: true,
                                uploadedAt: true,
                            },
                        },
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.jobApplication.count({ where: whereClause }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                applications: applications.map((app) => ({
                    id: app.id,
                    jobId: app.jobId,
                    candidateId: app.candidateId,
                    resumeId: app.resumeId || undefined,
                    resumeFilePath: app.resumeFilePath || undefined,
                    coverLetter: app.coverLetter || undefined,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    reviewedAt: app.reviewedAt || undefined,
                    reviewedBy: app.reviewedBy || undefined,
                    feedback: app.feedback || undefined,
                    updatedAt: app.updatedAt,
                    job: {
                        id: app.job.id,
                        title: app.job.title,
                        slug: app.job.slug,
                        description: app.job.description,
                        company: {
                            id: app.job.company.id,
                            name: app.job.company.name,
                            companyId: app.job.company.companyId,
                            logo: app.job.company.logo || undefined,
                        },
                        location: app.job.city
                            ? {
                                city: {
                                    id: app.job.city.id,
                                    name: app.job.city.name,
                                    state_id: app.job.city.state_id,
                                    state_code: app.job.city.state_code,
                                    state_name: app.job.city.state_name,
                                    country_id: app.job.city.country_id,
                                    country_code: app.job.city.country_code,
                                    country_name: app.job.city.country_name,
                                    latitude: app.job.city.latitude,
                                    longitude: app.job.city.longitude,
                                    wikiDataId: app.job.city.wikiDataId,
                                    isActive: app.job.city.isActive,
                                    createdAt: app.job.city.createdAt,
                                    updatedAt: app.job.city.updatedAt,
                                    state: {
                                        id: app.job.city.state.id,
                                        name: app.job.city.state.name,
                                        country_id: app.job.city.state.country_id,
                                        country_code: app.job.city.state.country_code,
                                        country_name: app.job.city.state.country_name,
                                        iso2: app.job.city.state.iso2,
                                        fips_code: app.job.city.state.fips_code,
                                        type: app.job.city.state.type,
                                        level: app.job.city.state.level,
                                        parent_id: app.job.city.state.parent_id,
                                        latitude: app.job.city.state.latitude,
                                        longitude: app.job.city.state.longitude,
                                        isActive: app.job.city.state.isActive,
                                        createdAt: app.job.city.state.createdAt,
                                        updatedAt: app.job.city.state.updatedAt,
                                        country: app.job.city.state.country
                                            ? {
                                                id: app.job.city.state.country.id,
                                                name: app.job.city.state.country.name,
                                                iso3: app.job.city.state.country.iso3,
                                                iso2: app.job.city.state.country.iso2,
                                                numeric_code: app.job.city.state.country.numeric_code,
                                                phonecode: app.job.city.state.country.phonecode,
                                                capital: app.job.city.state.country.capital,
                                                currency: app.job.city.state.country.currency,
                                                currency_name: app.job.city.state.country.currency_name,
                                                currency_symbol: app.job.city.state.country.currency_symbol,
                                                tld: app.job.city.state.country.tld,
                                                native: app.job.city.state.country.native,
                                                region: app.job.city.state.country.region,
                                                region_id: app.job.city.state.country.region_id,
                                                subregion: app.job.city.state.country.subregion,
                                                subregion_id: app.job.city.state.country.subregion_id,
                                                nationality: app.job.city.state.country.nationality,
                                                latitude: app.job.city.state.country.latitude,
                                                longitude: app.job.city.state.country.longitude,
                                                isActive: app.job.city.state.country.isActive,
                                                createdAt: app.job.city.state.country.createdAt,
                                                updatedAt: app.job.city.state.country.updatedAt,
                                            }
                                            : undefined,
                                    },
                                },
                            }
                            : undefined,
                    },
                    candidate: {
                        id: app.candidate.id,
                        firstName: app.candidate.firstName,
                        lastName: app.candidate.lastName,
                        email: app.candidate.user.email,
                        phone: app.candidate.user.phone || undefined,
                        profilePicture: app.candidate.profilePicture || undefined,
                        currentTitle: app.candidate.currentTitle || undefined,
                        experienceYears: app.candidate.experienceYears || undefined,
                        userId: app.candidate.user.id,
                        status: app.candidate.user.status,
                        city: app.candidate.city
                            ? {
                                id: app.candidate.city.id,
                                name: app.candidate.city.name,
                                state_id: app.candidate.city.state_id,
                                state_code: app.candidate.city.state_code,
                                state_name: app.candidate.city.state_name,
                                country_id: app.candidate.city.country_id,
                                country_code: app.candidate.city.country_code,
                                country_name: app.candidate.city.country_name,
                                latitude: app.candidate.city.latitude,
                                longitude: app.candidate.city.longitude,
                                wikiDataId: app.candidate.city.wikiDataId,
                                isActive: app.candidate.city.isActive,
                                createdAt: app.candidate.city.createdAt,
                                updatedAt: app.candidate.city.updatedAt,
                                state: {
                                    id: app.candidate.city.state.id,
                                    name: app.candidate.city.state.name,
                                    country_id: app.candidate.city.state.country_id,
                                    country_code: app.candidate.city.state.country_code,
                                    country_name: app.candidate.city.state.country_name,
                                    iso2: app.candidate.city.state.iso2,
                                    fips_code: app.candidate.city.state.fips_code,
                                    type: app.candidate.city.state.type,
                                    latitude: app.candidate.city.state.latitude,
                                    longitude: app.candidate.city.state.longitude,
                                    isActive: app.candidate.city.state.isActive,
                                    createdAt: app.candidate.city.state.createdAt,
                                    updatedAt: app.candidate.city.state.updatedAt,
                                    country: app.candidate.city.state.country
                                        ? {
                                            id: app.candidate.city.state.country.id,
                                            name: app.candidate.city.state.country.name,
                                            iso3: app.candidate.city.state.country.iso3,
                                            iso2: app.candidate.city.state.country.iso2,
                                            numeric_code: app.candidate.city.state.country.numeric_code,
                                            phonecode: app.candidate.city.state.country.phonecode,
                                            capital: app.candidate.city.state.country.capital,
                                            currency: app.candidate.city.state.country.currency,
                                            currency_name: app.candidate.city.state.country.currency_name,
                                            currency_symbol: app.candidate.city.state.country.currency_symbol,
                                            tld: app.candidate.city.state.country.tld,
                                            native: app.candidate.city.state.country.native,
                                            region: app.candidate.city.state.country.region,
                                            region_id: app.candidate.city.state.country.region_id,
                                            subregion: app.candidate.city.state.country.subregion,
                                            subregion_id: app.candidate.city.state.country.subregion_id,
                                            nationality: app.candidate.city.state.country.nationality,
                                            latitude: app.candidate.city.state.country.latitude,
                                            longitude: app.candidate.city.state.country.longitude,
                                            isActive: app.candidate.city.state.country.isActive,
                                            createdAt: app.candidate.city.state.country.createdAt,
                                            updatedAt: app.candidate.city.state.country.updatedAt,
                                        }
                                        : undefined,
                                },
                            }
                            : undefined,
                    },
                    resume: app.resume
                        ? {
                            id: app.resume.id,
                            title: app.resume.title,
                            fileName: app.resume.fileName,
                            filePath: app.resume.filePath || undefined,
                            uploadedAt: app.resume.uploadedAt,
                        }
                        : app.resumeFilePath
                            ? {
                                id: null,
                                title: 'Resume',
                                fileName: app.resumeFilePath.split('/').pop() || 'resume.pdf',
                                filePath: app.resumeFilePath,
                                uploadedAt: app.appliedAt,
                            }
                            : undefined,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch applications');
        }
    }
    async getApplicationDetails(applicationId, currentUser) {
        try {
            const application = await this.prisma.jobApplication.findUnique({
                where: { id: applicationId },
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    companyId: true,
                                    logo: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    phone: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    resume: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            if (!application) {
                throw new common_1.NotFoundException('Application not found');
            }
            return {
                id: application.id,
                jobId: application.jobId,
                candidateId: application.candidateId,
                resumeId: application.resumeId || undefined,
                coverLetter: application.coverLetter || undefined,
                status: application.status,
                appliedAt: application.appliedAt,
                reviewedAt: application.reviewedAt || undefined,
                reviewedBy: application.reviewedBy || undefined,
                feedback: application.feedback || undefined,
                updatedAt: application.updatedAt,
                job: {
                    id: application.job.id,
                    title: application.job.title,
                    slug: application.job.slug,
                    description: application.job.description,
                    company: {
                        id: application.job.company.id,
                        name: application.job.company.name,
                        companyId: application.job.company.companyId,
                        logo: application.job.company.logo || undefined,
                    },
                    location: application.job.city
                        ? {
                            city: {
                                id: application.job.city.id,
                                name: application.job.city.name,
                                state_id: application.job.city.state_id,
                                state_code: application.job.city.state_code,
                                state_name: application.job.city.state_name,
                                country_id: application.job.city.country_id,
                                country_code: application.job.city.country_code,
                                country_name: application.job.city.country_name,
                                latitude: application.job.city.latitude,
                                longitude: application.job.city.longitude,
                                wikiDataId: application.job.city.wikiDataId,
                                isActive: application.job.city.isActive,
                                createdAt: application.job.city.createdAt,
                                updatedAt: application.job.city.updatedAt,
                                state: {
                                    id: application.job.city.state.id,
                                    name: application.job.city.state.name,
                                    country_id: application.job.city.state.country_id,
                                    country_code: application.job.city.state.country_code,
                                    country_name: application.job.city.state.country_name,
                                    iso2: application.job.city.state.iso2,
                                    fips_code: application.job.city.state.fips_code,
                                    type: application.job.city.state.type,
                                    latitude: application.job.city.state.latitude,
                                    longitude: application.job.city.state.longitude,
                                    isActive: application.job.city.state.isActive,
                                    createdAt: application.job.city.state.createdAt,
                                    updatedAt: application.job.city.state.updatedAt,
                                    country: application.job.city.state.country
                                        ? {
                                            id: application.job.city.state.country.id,
                                            name: application.job.city.state.country.name,
                                            iso3: application.job.city.state.country.iso3,
                                            iso2: application.job.city.state.country.iso2,
                                            numeric_code: application.job.city.state.country.numeric_code,
                                            phonecode: application.job.city.state.country.phonecode,
                                            capital: application.job.city.state.country.capital,
                                            currency: application.job.city.state.country.currency,
                                            currency_name: application.job.city.state.country.currency_name,
                                            currency_symbol: application.job.city.state.country.currency_symbol,
                                            tld: application.job.city.state.country.tld,
                                            native: application.job.city.state.country.native,
                                            region: application.job.city.state.country.region,
                                            region_id: application.job.city.state.country.region_id,
                                            subregion: application.job.city.state.country.subregion,
                                            subregion_id: application.job.city.state.country.subregion_id,
                                            nationality: application.job.city.state.country.nationality,
                                            latitude: application.job.city.state.country.latitude,
                                            longitude: application.job.city.state.country.longitude,
                                            isActive: application.job.city.state.country.isActive,
                                            createdAt: application.job.city.state.country.createdAt,
                                            updatedAt: application.job.city.state.country.updatedAt,
                                        }
                                        : undefined,
                                },
                            },
                        }
                        : undefined,
                },
                candidate: {
                    id: application.candidate.id,
                    firstName: application.candidate.firstName,
                    lastName: application.candidate.lastName,
                    email: application.candidate.user.email,
                    phone: application.candidate.user.phone || undefined,
                    profilePicture: application.candidate.profilePicture || undefined,
                    currentTitle: application.candidate.currentTitle || undefined,
                    experienceYears: application.candidate.experienceYears || undefined,
                    city: application.candidate.city
                        ? {
                            id: application.candidate.city.id,
                            name: application.candidate.city.name,
                            state_id: application.candidate.city.state_id,
                            state_code: application.candidate.city.state_code,
                            state_name: application.candidate.city.state_name,
                            country_id: application.candidate.city.country_id,
                            country_code: application.candidate.city.country_code,
                            country_name: application.candidate.city.country_name,
                            latitude: application.candidate.city.latitude,
                            longitude: application.candidate.city.longitude,
                            wikiDataId: application.candidate.city.wikiDataId,
                            isActive: application.candidate.city.isActive,
                            createdAt: application.candidate.city.createdAt,
                            updatedAt: application.candidate.city.updatedAt,
                            state: {
                                id: application.candidate.city.state.id,
                                name: application.candidate.city.state.name,
                                country_id: application.candidate.city.state.country_id,
                                country_code: application.candidate.city.state.country_code,
                                country_name: application.candidate.city.state.country_name,
                                iso2: application.candidate.city.state.iso2,
                                fips_code: application.candidate.city.state.fips_code,
                                type: application.candidate.city.state.type,
                                latitude: application.candidate.city.state.latitude,
                                longitude: application.candidate.city.state.longitude,
                                isActive: application.candidate.city.state.isActive,
                                createdAt: application.candidate.city.state.createdAt,
                                updatedAt: application.candidate.city.state.updatedAt,
                                country: application.candidate.city.state.country
                                    ? {
                                        id: application.candidate.city.state.country.id,
                                        name: application.candidate.city.state.country.name,
                                        iso3: application.candidate.city.state.country.iso3,
                                        iso2: application.candidate.city.state.country.iso2,
                                        numeric_code: application.candidate.city.state.country.numeric_code,
                                        phonecode: application.candidate.city.state.country.phonecode,
                                        capital: application.candidate.city.state.country.capital,
                                        currency: application.candidate.city.state.country.currency,
                                        currency_name: application.candidate.city.state.country.currency_name,
                                        currency_symbol: application.candidate.city.state.country.currency_symbol,
                                        tld: application.candidate.city.state.country.tld,
                                        native: application.candidate.city.state.country.native,
                                        region: application.candidate.city.state.country.region,
                                        region_id: application.candidate.city.state.country.region_id,
                                        subregion: application.candidate.city.state.country.subregion,
                                        subregion_id: application.candidate.city.state.country.subregion_id,
                                        nationality: application.candidate.city.state.country.nationality,
                                        latitude: application.candidate.city.state.country.latitude,
                                        longitude: application.candidate.city.state.country.longitude,
                                        isActive: application.candidate.city.state.country.isActive,
                                        createdAt: application.candidate.city.state.country.createdAt,
                                        updatedAt: application.candidate.city.state.country.updatedAt,
                                    }
                                    : undefined,
                            },
                        }
                        : undefined,
                },
                resume: application.resume
                    ? {
                        id: application.resume.id,
                        title: application.resume.title,
                        fileName: application.resume.fileName,
                        uploadedAt: application.resume.uploadedAt,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch application details');
        }
    }
    async updateApplicationStatus(applicationId, updateDto, currentUser) {
        try {
            const application = await this.prisma.jobApplication.findUnique({
                where: { id: applicationId },
            });
            if (!application) {
                throw new common_1.NotFoundException('Application not found');
            }
            const updatedApplication = await this.prisma.jobApplication.update({
                where: { id: applicationId },
                data: {
                    status: updateDto.status,
                    reviewedAt: new Date(),
                    reviewedBy: currentUser.id,
                },
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    companyId: true,
                                    logo: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    phone: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    resume: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'JobApplication', applicationId, `Application status updated to ${updateDto.status}`);
            return {
                id: updatedApplication.id,
                jobId: updatedApplication.jobId,
                candidateId: updatedApplication.candidateId,
                resumeId: updatedApplication.resumeId || undefined,
                coverLetter: updatedApplication.coverLetter || undefined,
                status: updatedApplication.status,
                appliedAt: updatedApplication.appliedAt,
                reviewedAt: updatedApplication.reviewedAt || undefined,
                reviewedBy: updatedApplication.reviewedBy || undefined,
                feedback: updatedApplication.feedback || undefined,
                updatedAt: updatedApplication.updatedAt,
                job: {
                    id: updatedApplication.job.id,
                    title: updatedApplication.job.title,
                    slug: updatedApplication.job.slug,
                    description: updatedApplication.job.description,
                    company: {
                        id: updatedApplication.job.company.id,
                        name: updatedApplication.job.company.name,
                        companyId: updatedApplication.job.company.companyId,
                        logo: updatedApplication.job.company.logo || undefined,
                    },
                    location: updatedApplication.job.city
                        ? {
                            city: {
                                id: updatedApplication.job.city.id,
                                name: updatedApplication.job.city.name,
                                state_id: updatedApplication.job.city.state_id,
                                state_code: updatedApplication.job.city.state_code,
                                state_name: updatedApplication.job.city.state_name,
                                country_id: updatedApplication.job.city.country_id,
                                country_code: updatedApplication.job.city.country_code,
                                country_name: updatedApplication.job.city.country_name,
                                latitude: updatedApplication.job.city.latitude,
                                longitude: updatedApplication.job.city.longitude,
                                wikiDataId: updatedApplication.job.city.wikiDataId,
                                isActive: updatedApplication.job.city.isActive,
                                createdAt: updatedApplication.job.city.createdAt,
                                updatedAt: updatedApplication.job.city.updatedAt,
                                state: {
                                    id: updatedApplication.job.city.state.id,
                                    name: updatedApplication.job.city.state.name,
                                    country_id: updatedApplication.job.city.state.country_id,
                                    country_code: updatedApplication.job.city.state.country_code,
                                    country_name: updatedApplication.job.city.state.country_name,
                                    iso2: updatedApplication.job.city.state.iso2,
                                    fips_code: updatedApplication.job.city.state.fips_code,
                                    type: updatedApplication.job.city.state.type,
                                    latitude: updatedApplication.job.city.state.latitude,
                                    longitude: updatedApplication.job.city.state.longitude,
                                    isActive: updatedApplication.job.city.state.isActive,
                                    createdAt: updatedApplication.job.city.state.createdAt,
                                    updatedAt: updatedApplication.job.city.state.updatedAt,
                                    country: updatedApplication.job.city.state.country
                                        ? {
                                            id: updatedApplication.job.city.state.country.id,
                                            name: updatedApplication.job.city.state.country.name,
                                            iso3: updatedApplication.job.city.state.country.iso3,
                                            iso2: updatedApplication.job.city.state.country.iso2,
                                            numeric_code: updatedApplication.job.city.state.country.numeric_code,
                                            phonecode: updatedApplication.job.city.state.country.phonecode,
                                            capital: updatedApplication.job.city.state.country.capital,
                                            currency: updatedApplication.job.city.state.country.currency,
                                            currency_name: updatedApplication.job.city.state.country.currency_name,
                                            currency_symbol: updatedApplication.job.city.state.country.currency_symbol,
                                            tld: updatedApplication.job.city.state.country.tld,
                                            native: updatedApplication.job.city.state.country.native,
                                            region: updatedApplication.job.city.state.country.region,
                                            region_id: updatedApplication.job.city.state.country.region_id,
                                            subregion: updatedApplication.job.city.state.country.subregion,
                                            subregion_id: updatedApplication.job.city.state.country.subregion_id,
                                            nationality: updatedApplication.job.city.state.country.nationality,
                                            latitude: updatedApplication.job.city.state.country.latitude,
                                            longitude: updatedApplication.job.city.state.country.longitude,
                                            isActive: updatedApplication.job.city.state.country.isActive,
                                            createdAt: updatedApplication.job.city.state.country.createdAt,
                                            updatedAt: updatedApplication.job.city.state.country.updatedAt,
                                        }
                                        : undefined,
                                },
                            },
                        }
                        : undefined,
                },
                candidate: {
                    id: updatedApplication.candidate.id,
                    firstName: updatedApplication.candidate.firstName,
                    lastName: updatedApplication.candidate.lastName,
                    email: updatedApplication.candidate.user.email,
                    phone: updatedApplication.candidate.user.phone || undefined,
                    profilePicture: updatedApplication.candidate.profilePicture || undefined,
                    currentTitle: updatedApplication.candidate.currentTitle || undefined,
                    experienceYears: updatedApplication.candidate.experienceYears || undefined,
                    city: updatedApplication.candidate.city
                        ? {
                            id: updatedApplication.candidate.city.id,
                            name: updatedApplication.candidate.city.name,
                            state_id: updatedApplication.candidate.city.state_id,
                            state_code: updatedApplication.candidate.city.state_code,
                            state_name: updatedApplication.candidate.city.state_name,
                            country_id: updatedApplication.candidate.city.country_id,
                            country_code: updatedApplication.candidate.city.country_code,
                            country_name: updatedApplication.candidate.city.country_name,
                            latitude: updatedApplication.candidate.city.latitude,
                            longitude: updatedApplication.candidate.city.longitude,
                            wikiDataId: updatedApplication.candidate.city.wikiDataId,
                            isActive: updatedApplication.candidate.city.isActive,
                            createdAt: updatedApplication.candidate.city.createdAt,
                            updatedAt: updatedApplication.candidate.city.updatedAt,
                            state: {
                                id: updatedApplication.candidate.city.state.id,
                                name: updatedApplication.candidate.city.state.name,
                                country_id: updatedApplication.candidate.city.state.country_id,
                                country_code: updatedApplication.candidate.city.state.country_code,
                                country_name: updatedApplication.candidate.city.state.country_name,
                                iso2: updatedApplication.candidate.city.state.iso2,
                                fips_code: updatedApplication.candidate.city.state.fips_code,
                                type: updatedApplication.candidate.city.state.type,
                                latitude: updatedApplication.candidate.city.state.latitude,
                                longitude: updatedApplication.candidate.city.state.longitude,
                                isActive: updatedApplication.candidate.city.state.isActive,
                                createdAt: updatedApplication.candidate.city.state.createdAt,
                                updatedAt: updatedApplication.candidate.city.state.updatedAt,
                                country: updatedApplication.candidate.city.state.country
                                    ? {
                                        id: updatedApplication.candidate.city.state.country.id,
                                        name: updatedApplication.candidate.city.state.country.name,
                                        iso3: updatedApplication.candidate.city.state.country.iso3,
                                        iso2: updatedApplication.candidate.city.state.country.iso2,
                                        numeric_code: updatedApplication.candidate.city.state.country.numeric_code,
                                        phonecode: updatedApplication.candidate.city.state.country.phonecode,
                                        capital: updatedApplication.candidate.city.state.country.capital,
                                        currency: updatedApplication.candidate.city.state.country.currency,
                                        currency_name: updatedApplication.candidate.city.state.country.currency_name,
                                        currency_symbol: updatedApplication.candidate.city.state.country.currency_symbol,
                                        tld: updatedApplication.candidate.city.state.country.tld,
                                        native: updatedApplication.candidate.city.state.country.native,
                                        region: updatedApplication.candidate.city.state.country.region,
                                        region_id: updatedApplication.candidate.city.state.country.region_id,
                                        subregion: updatedApplication.candidate.city.state.country.subregion,
                                        subregion_id: updatedApplication.candidate.city.state.country.subregion_id,
                                        nationality: updatedApplication.candidate.city.state.country.nationality,
                                        latitude: updatedApplication.candidate.city.state.country.latitude,
                                        longitude: updatedApplication.candidate.city.state.country.longitude,
                                        isActive: updatedApplication.candidate.city.state.country.isActive,
                                        createdAt: updatedApplication.candidate.city.state.country.createdAt,
                                        updatedAt: updatedApplication.candidate.city.state.country.updatedAt,
                                    }
                                    : undefined,
                            },
                        }
                        : undefined,
                },
                resume: updatedApplication.resume
                    ? {
                        id: updatedApplication.resume.id,
                        title: updatedApplication.resume.title,
                        fileName: updatedApplication.resume.fileName,
                        uploadedAt: updatedApplication.resume.uploadedAt,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update application status');
        }
    }
    async addApplicationFeedback(applicationId, feedbackDto, currentUser) {
        try {
            const application = await this.prisma.jobApplication.findUnique({
                where: { id: applicationId },
            });
            if (!application) {
                throw new common_1.NotFoundException('Application not found');
            }
            const updatedApplication = await this.prisma.jobApplication.update({
                where: { id: applicationId },
                data: {
                    feedback: feedbackDto.feedback,
                    reviewedAt: new Date(),
                    reviewedBy: currentUser.id,
                },
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    companyId: true,
                                    logo: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    phone: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    resume: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            uploadedAt: true,
                        },
                    },
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'JobApplication', applicationId, 'Feedback added to application');
            return {
                id: updatedApplication.id,
                jobId: updatedApplication.jobId,
                candidateId: updatedApplication.candidateId,
                resumeId: updatedApplication.resumeId || undefined,
                coverLetter: updatedApplication.coverLetter || undefined,
                status: updatedApplication.status,
                appliedAt: updatedApplication.appliedAt,
                reviewedAt: updatedApplication.reviewedAt || undefined,
                reviewedBy: updatedApplication.reviewedBy || undefined,
                feedback: updatedApplication.feedback || undefined,
                updatedAt: updatedApplication.updatedAt,
                job: {
                    id: updatedApplication.job.id,
                    title: updatedApplication.job.title,
                    slug: updatedApplication.job.slug,
                    description: updatedApplication.job.description,
                    company: {
                        id: updatedApplication.job.company.id,
                        name: updatedApplication.job.company.name,
                        companyId: updatedApplication.job.company.companyId,
                        logo: updatedApplication.job.company.logo || undefined,
                    },
                    location: updatedApplication.job.city
                        ? {
                            city: {
                                id: updatedApplication.job.city.id,
                                name: updatedApplication.job.city.name,
                                state_id: updatedApplication.job.city.state_id,
                                state_code: updatedApplication.job.city.state_code,
                                state_name: updatedApplication.job.city.state_name,
                                country_id: updatedApplication.job.city.country_id,
                                country_code: updatedApplication.job.city.country_code,
                                country_name: updatedApplication.job.city.country_name,
                                latitude: updatedApplication.job.city.latitude,
                                longitude: updatedApplication.job.city.longitude,
                                wikiDataId: updatedApplication.job.city.wikiDataId,
                                isActive: updatedApplication.job.city.isActive,
                                createdAt: updatedApplication.job.city.createdAt,
                                updatedAt: updatedApplication.job.city.updatedAt,
                                state: {
                                    id: updatedApplication.job.city.state.id,
                                    name: updatedApplication.job.city.state.name,
                                    country_id: updatedApplication.job.city.state.country_id,
                                    country_code: updatedApplication.job.city.state.country_code,
                                    country_name: updatedApplication.job.city.state.country_name,
                                    iso2: updatedApplication.job.city.state.iso2,
                                    fips_code: updatedApplication.job.city.state.fips_code,
                                    type: updatedApplication.job.city.state.type,
                                    latitude: updatedApplication.job.city.state.latitude,
                                    longitude: updatedApplication.job.city.state.longitude,
                                    isActive: updatedApplication.job.city.state.isActive,
                                    createdAt: updatedApplication.job.city.state.createdAt,
                                    updatedAt: updatedApplication.job.city.state.updatedAt,
                                    country: updatedApplication.job.city.state.country
                                        ? {
                                            id: updatedApplication.job.city.state.country.id,
                                            name: updatedApplication.job.city.state.country.name,
                                            iso3: updatedApplication.job.city.state.country.iso3,
                                            iso2: updatedApplication.job.city.state.country.iso2,
                                            numeric_code: updatedApplication.job.city.state.country.numeric_code,
                                            phonecode: updatedApplication.job.city.state.country.phonecode,
                                            capital: updatedApplication.job.city.state.country.capital,
                                            currency: updatedApplication.job.city.state.country.currency,
                                            currency_name: updatedApplication.job.city.state.country.currency_name,
                                            currency_symbol: updatedApplication.job.city.state.country.currency_symbol,
                                            tld: updatedApplication.job.city.state.country.tld,
                                            native: updatedApplication.job.city.state.country.native,
                                            region: updatedApplication.job.city.state.country.region,
                                            region_id: updatedApplication.job.city.state.country.region_id,
                                            subregion: updatedApplication.job.city.state.country.subregion,
                                            subregion_id: updatedApplication.job.city.state.country.subregion_id,
                                            nationality: updatedApplication.job.city.state.country.nationality,
                                            latitude: updatedApplication.job.city.state.country.latitude,
                                            longitude: updatedApplication.job.city.state.country.longitude,
                                            isActive: updatedApplication.job.city.state.country.isActive,
                                            createdAt: updatedApplication.job.city.state.country.createdAt,
                                            updatedAt: updatedApplication.job.city.state.country.updatedAt,
                                        }
                                        : undefined,
                                },
                            },
                        }
                        : undefined,
                },
                candidate: {
                    id: updatedApplication.candidate.id,
                    firstName: updatedApplication.candidate.firstName,
                    lastName: updatedApplication.candidate.lastName,
                    email: updatedApplication.candidate.user.email,
                    phone: updatedApplication.candidate.user.phone || undefined,
                    profilePicture: updatedApplication.candidate.profilePicture || undefined,
                    currentTitle: updatedApplication.candidate.currentTitle || undefined,
                    experienceYears: updatedApplication.candidate.experienceYears || undefined,
                    city: updatedApplication.candidate.city
                        ? {
                            id: updatedApplication.candidate.city.id,
                            name: updatedApplication.candidate.city.name,
                            state_id: updatedApplication.candidate.city.state_id,
                            state_code: updatedApplication.candidate.city.state_code,
                            state_name: updatedApplication.candidate.city.state_name,
                            country_id: updatedApplication.candidate.city.country_id,
                            country_code: updatedApplication.candidate.city.country_code,
                            country_name: updatedApplication.candidate.city.country_name,
                            latitude: updatedApplication.candidate.city.latitude,
                            longitude: updatedApplication.candidate.city.longitude,
                            wikiDataId: updatedApplication.candidate.city.wikiDataId,
                            isActive: updatedApplication.candidate.city.isActive,
                            createdAt: updatedApplication.candidate.city.createdAt,
                            updatedAt: updatedApplication.candidate.city.updatedAt,
                            state: {
                                id: updatedApplication.candidate.city.state.id,
                                name: updatedApplication.candidate.city.state.name,
                                country_id: updatedApplication.candidate.city.state.country_id,
                                country_code: updatedApplication.candidate.city.state.country_code,
                                country_name: updatedApplication.candidate.city.state.country_name,
                                iso2: updatedApplication.candidate.city.state.iso2,
                                fips_code: updatedApplication.candidate.city.state.fips_code,
                                type: updatedApplication.candidate.city.state.type,
                                latitude: updatedApplication.candidate.city.state.latitude,
                                longitude: updatedApplication.candidate.city.state.longitude,
                                isActive: updatedApplication.candidate.city.state.isActive,
                                createdAt: updatedApplication.candidate.city.state.createdAt,
                                updatedAt: updatedApplication.candidate.city.state.updatedAt,
                                country: updatedApplication.candidate.city.state.country
                                    ? {
                                        id: updatedApplication.candidate.city.state.country.id,
                                        name: updatedApplication.candidate.city.state.country.name,
                                        iso3: updatedApplication.candidate.city.state.country.iso3,
                                        iso2: updatedApplication.candidate.city.state.country.iso2,
                                        numeric_code: updatedApplication.candidate.city.state.country.numeric_code,
                                        phonecode: updatedApplication.candidate.city.state.country.phonecode,
                                        capital: updatedApplication.candidate.city.state.country.capital,
                                        currency: updatedApplication.candidate.city.state.country.currency,
                                        currency_name: updatedApplication.candidate.city.state.country.currency_name,
                                        currency_symbol: updatedApplication.candidate.city.state.country.currency_symbol,
                                        tld: updatedApplication.candidate.city.state.country.tld,
                                        native: updatedApplication.candidate.city.state.country.native,
                                        region: updatedApplication.candidate.city.state.country.region,
                                        region_id: updatedApplication.candidate.city.state.country.region_id,
                                        subregion: updatedApplication.candidate.city.state.country.subregion,
                                        subregion_id: updatedApplication.candidate.city.state.country.subregion_id,
                                        nationality: updatedApplication.candidate.city.state.country.nationality,
                                        latitude: updatedApplication.candidate.city.state.country.latitude,
                                        longitude: updatedApplication.candidate.city.state.country.longitude,
                                        isActive: updatedApplication.candidate.city.state.country.isActive,
                                        createdAt: updatedApplication.candidate.city.state.country.createdAt,
                                        updatedAt: updatedApplication.candidate.city.state.country.updatedAt,
                                    }
                                    : undefined,
                            },
                        }
                        : undefined,
                },
                resume: updatedApplication.resume
                    ? {
                        id: updatedApplication.resume.id,
                        title: updatedApplication.resume.title,
                        fileName: updatedApplication.resume.fileName,
                        uploadedAt: updatedApplication.resume.uploadedAt,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to add feedback to application');
        }
    }
    async getApplicationStats(currentUser) {
        try {
            const [total, byStatus, byJobType, byExperienceLevel, recentApplications, averageResponseTime,] = await Promise.all([
                this.prisma.jobApplication.count(),
                this.prisma.jobApplication.groupBy({
                    by: ['status'],
                    _count: { status: true },
                }),
                this.prisma.jobApplication
                    .groupBy({
                    by: ['jobId'],
                    _count: { jobId: true },
                })
                    .then(async (result) => {
                    const jobIds = result.map((r) => r.jobId);
                    const jobs = await this.prisma.job.findMany({
                        where: { id: { in: jobIds } },
                        select: { id: true, jobType: true },
                    });
                    const jobTypeMap = new Map(jobs.map((job) => [job.id, job.jobType]));
                    const byJobType = {
                        FULL_TIME: 0,
                        PART_TIME: 0,
                        CONTRACT: 0,
                        INTERNSHIP: 0,
                        FREELANCE: 0,
                    };
                    result.forEach((r) => {
                        const jobType = jobTypeMap.get(r.jobId);
                        if (jobType && byJobType.hasOwnProperty(jobType)) {
                            byJobType[jobType] += r._count.jobId;
                        }
                    });
                    return byJobType;
                }),
                this.prisma.jobApplication
                    .groupBy({
                    by: ['jobId'],
                    _count: { jobId: true },
                })
                    .then(async (result) => {
                    const jobIds = result.map((r) => r.jobId);
                    const jobs = await this.prisma.job.findMany({
                        where: { id: { in: jobIds } },
                        select: { id: true, experienceLevel: true },
                    });
                    const experienceLevelMap = new Map(jobs.map((job) => [job.id, job.experienceLevel]));
                    const byExperienceLevel = {
                        ENTRY_LEVEL: 0,
                        MID_LEVEL: 0,
                        SENIOR_LEVEL: 0,
                        EXECUTIVE: 0,
                    };
                    result.forEach((r) => {
                        const experienceLevel = experienceLevelMap.get(r.jobId);
                        if (experienceLevel &&
                            byExperienceLevel.hasOwnProperty(experienceLevel)) {
                            byExperienceLevel[experienceLevel] += r._count.jobId;
                        }
                    });
                    return byExperienceLevel;
                }),
                this.prisma.jobApplication.count({
                    where: {
                        appliedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.jobApplication
                    .findMany({
                    where: {
                        reviewedAt: { not: null },
                    },
                    select: {
                        appliedAt: true,
                        reviewedAt: true,
                    },
                })
                    .then((applications) => {
                    if (applications.length === 0)
                        return 0;
                    const totalDays = applications.reduce((sum, app) => {
                        const days = (app.reviewedAt.getTime() - app.appliedAt.getTime()) /
                            (1000 * 60 * 60 * 24);
                        return sum + days;
                    }, 0);
                    return totalDays / applications.length;
                }),
            ]);
            const statusData = {
                APPLIED: 0,
                UNDER_REVIEW: 0,
                SHORTLISTED: 0,
                INTERVIEWED: 0,
                SELECTED: 0,
                REJECTED: 0,
                WITHDRAWN: 0,
            };
            byStatus.forEach((status) => {
                if (statusData.hasOwnProperty(status.status)) {
                    statusData[status.status] = status._count.status;
                }
            });
            return {
                total,
                byStatus: statusData,
                byJobType,
                byExperienceLevel,
                recentApplications,
                averageResponseTime: Math.round(averageResponseTime * 100) / 100,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch application statistics');
        }
    }
    async bulkUpdateApplications(bulkUpdateDto, currentUser) {
        try {
            const { applicationIds, status, feedback } = bulkUpdateDto;
            const failedApplications = [];
            let updatedCount = 0;
            for (const applicationId of applicationIds) {
                try {
                    const application = await this.prisma.jobApplication.findUnique({
                        where: { id: applicationId },
                    });
                    if (!application) {
                        failedApplications.push({
                            applicationId,
                            error: 'Application not found',
                        });
                        continue;
                    }
                    const updateData = {
                        status,
                        reviewedAt: new Date(),
                        reviewedBy: currentUser.id,
                    };
                    if (feedback) {
                        updateData.feedback = feedback;
                    }
                    await this.prisma.jobApplication.update({
                        where: { id: applicationId },
                        data: updateData,
                    });
                    await this.logActivity(currentUser.id, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'JobApplication', applicationId, `Bulk update: Status changed to ${status}`);
                    updatedCount++;
                }
                catch (error) {
                    failedApplications.push({
                        applicationId,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
            return {
                success: failedApplications.length === 0,
                updatedCount,
                failedCount: failedApplications.length,
                failedApplications,
                message: `Successfully updated ${updatedCount} applications. ${failedApplications.length} failed.`,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to perform bulk update');
        }
    }
    async bulkExportApplications(exportQuery, currentUser) {
        try {
            const format = exportQuery.format || 'csv';
            const whereClause = {};
            if (exportQuery.status) {
                whereClause.status = exportQuery.status;
            }
            if (exportQuery.jobTitle || exportQuery.companyName) {
                whereClause.job = {};
                if (exportQuery.jobTitle) {
                    whereClause.job.title = {
                        contains: exportQuery.jobTitle,
                        mode: 'insensitive',
                    };
                }
                if (exportQuery.companyName) {
                    whereClause.job.company = {
                        name: { contains: exportQuery.companyName, mode: 'insensitive' },
                    };
                }
            }
            if (exportQuery.candidateName) {
                whereClause.candidate = {
                    OR: [
                        {
                            firstName: {
                                contains: exportQuery.candidateName,
                                mode: 'insensitive',
                            },
                        },
                        {
                            lastName: {
                                contains: exportQuery.candidateName,
                                mode: 'insensitive',
                            },
                        },
                    ],
                };
            }
            if (exportQuery.appliedFrom || exportQuery.appliedTo) {
                whereClause.appliedAt = {};
                if (exportQuery.appliedFrom) {
                    whereClause.appliedAt.gte = new Date(exportQuery.appliedFrom);
                }
                if (exportQuery.appliedTo) {
                    whereClause.appliedAt.lte = new Date(exportQuery.appliedTo);
                }
            }
            const applications = await this.prisma.jobApplication.findMany({
                where: whereClause,
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    companyId: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    phone: true,
                                },
                            },
                            city: {
                                include: {
                                    state: {
                                        include: {
                                            country: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { appliedAt: 'desc' },
            });
            const exportData = applications.map((app) => ({
                'Application ID': app.id,
                'Job Title': app.job.title,
                Company: app.job.company.companyId || app.job.company.name,
                'Candidate Name': `${app.candidate.firstName} ${app.candidate.lastName}`,
                'Candidate Email': app.candidate.user.email,
                'Candidate Phone': app.candidate.user.phone || '',
                Status: app.status,
                'Applied Date': app.appliedAt.toISOString().split('T')[0],
                'Reviewed Date': app.reviewedAt
                    ? app.reviewedAt.toISOString().split('T')[0]
                    : '',
                'Cover Letter': app.coverLetter || '',
                Feedback: app.feedback || '',
                Location: app.job.city && app.job.city.state && app.job.city.state.country
                    ? `${app.job.city.name}, ${app.job.city.state.name}, ${app.job.city.state.country.name}`
                    : '',
                'Job Type': app.job.jobType,
                'Experience Level': app.job.experienceLevel,
                'Work Mode': app.job.workMode,
            }));
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `applications_export_${timestamp}.${format}`;
            const downloadUrl = `/api/admin/applications/download/${fileName}`;
            await this.logActivity(currentUser.id, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'JobApplication', 'bulk-export', `Exported ${applications.length} applications in ${format.toUpperCase()} format`);
            return {
                success: true,
                downloadUrl,
                fileName,
                totalExported: applications.length,
                message: `Successfully exported ${applications.length} applications to ${format.toUpperCase()} format`,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to export applications');
        }
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    action,
                    level,
                    entity,
                    entityId,
                    description,
                    metadata,
                    ipAddress,
                    userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    async getAllResumes(query, currentUser) {
        try {
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const where = {};
            if (query.candidateId) {
                where.candidateId = query.candidateId;
            }
            if (query.isDefault !== undefined) {
                where.isDefault = query.isDefault;
            }
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { fileName: { contains: query.search, mode: 'insensitive' } },
                    {
                        candidate: {
                            OR: [
                                { firstName: { contains: query.search, mode: 'insensitive' } },
                                { lastName: { contains: query.search, mode: 'insensitive' } },
                            ],
                        },
                    },
                ];
            }
            const orderBy = {};
            if (query.sortBy) {
                orderBy[query.sortBy] = query.sortOrder || 'desc';
            }
            else {
                orderBy.uploadedAt = 'desc';
            }
            const [resumes, total] = await Promise.all([
                this.prisma.resume.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                    include: {
                        candidate: {
                            include: {
                                user: {
                                    select: {
                                        email: true,
                                        phone: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                this.prisma.resume.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                resumes: resumes.map((resume) => ({
                    id: resume.id,
                    candidateId: resume.candidateId,
                    title: resume.title,
                    fileName: resume.fileName,
                    filePath: resume.filePath,
                    fileSize: resume.fileSize,
                    mimeType: resume.mimeType,
                    isDefault: resume.isDefault,
                    uploadedAt: resume.uploadedAt,
                    updatedAt: resume.updatedAt,
                    candidate: {
                        id: resume.candidate.id,
                        firstName: resume.candidate.firstName,
                        lastName: resume.candidate.lastName,
                        email: resume.candidate.user.email,
                        phone: resume.candidate.user.phone || undefined,
                        currentTitle: resume.candidate.currentTitle || undefined,
                        experienceYears: resume.candidate.experienceYears || undefined,
                    },
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch resumes');
        }
    }
    async getResumeById(resumeId, currentUser) {
        try {
            const resume = await this.prisma.resume.findUnique({
                where: { id: resumeId },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!resume) {
                throw new common_1.NotFoundException('Resume not found');
            }
            return {
                id: resume.id,
                candidateId: resume.candidateId,
                title: resume.title,
                fileName: resume.fileName,
                filePath: resume.filePath,
                fileSize: resume.fileSize,
                mimeType: resume.mimeType,
                isDefault: resume.isDefault,
                uploadedAt: resume.uploadedAt,
                updatedAt: resume.updatedAt,
                candidate: {
                    id: resume.candidate.id,
                    firstName: resume.candidate.firstName,
                    lastName: resume.candidate.lastName,
                    email: resume.candidate.user.email,
                    phone: resume.candidate.user.phone || undefined,
                    currentTitle: resume.candidate.currentTitle || undefined,
                    experienceYears: resume.candidate.experienceYears || undefined,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch resume');
        }
    }
    async downloadResume(resumeId, currentUser) {
        try {
            const resume = await this.prisma.resume.findUnique({
                where: { id: resumeId },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!resume) {
                throw new common_1.NotFoundException('Resume not found');
            }
            await this.logActivity(currentUser.id, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'Resume', resumeId, `Resume downloaded: ${resume.fileName}`);
            return {
                success: true,
                message: 'Resume download initiated',
                data: {
                    resumeId: resume.id,
                    fileName: resume.fileName,
                    filePath: resume.filePath,
                    fileSize: resume.fileSize,
                    mimeType: resume.mimeType,
                    candidateName: `${resume.candidate.firstName} ${resume.candidate.lastName}`,
                    candidateEmail: resume.candidate.user.email,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to download resume');
        }
    }
    async bulkDownloadResumes(bulkDownloadDto, currentUser) {
        try {
            const resumes = await this.prisma.resume.findMany({
                where: {
                    id: { in: bulkDownloadDto.resumeIds },
                },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            if (resumes.length !== bulkDownloadDto.resumeIds.length) {
                throw new common_1.BadRequestException('One or more resume IDs not found');
            }
            const totalSize = resumes.reduce((sum, resume) => sum + resume.fileSize, 0);
            await this.logActivity(currentUser.id, client_1.LogAction.VIEW, client_1.LogLevel.INFO, 'Resume', bulkDownloadDto.resumeIds.join(','), `Bulk download initiated for ${resumes.length} resumes`);
            const downloadUrl = `https://temp-storage.example.com/bulk-downloads/${(0, uuid_1.v4)()}.zip`;
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            return {
                success: true,
                message: 'Bulk download package created successfully',
                data: {
                    downloadUrl,
                    expiresAt,
                    fileCount: resumes.length,
                    totalSize,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create bulk download package');
        }
    }
    async getResumeStats(currentUser) {
        try {
            const [total, byMimeType, averageFileSize, recentUploads, defaultResumes,] = await Promise.all([
                this.prisma.resume.count(),
                this.prisma.resume.groupBy({
                    by: ['mimeType'],
                    _count: true,
                }),
                this.prisma.resume.aggregate({
                    _avg: {
                        fileSize: true,
                    },
                }),
                this.prisma.resume.count({
                    where: {
                        uploadedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                this.prisma.resume.count({
                    where: {
                        isDefault: true,
                    },
                }),
            ]);
            const mimeTypeStats = {
                'application/pdf': 0,
                'application/msword': 0,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 0,
                'text/plain': 0,
                other: 0,
            };
            byMimeType.forEach((item) => {
                const mimeType = item.mimeType;
                if (mimeTypeStats.hasOwnProperty(mimeType)) {
                    mimeTypeStats[mimeType] = item._count;
                }
                else {
                    mimeTypeStats.other += item._count;
                }
            });
            return {
                total,
                byMimeType: mimeTypeStats,
                averageFileSize: Math.round(averageFileSize._avg.fileSize || 0),
                recentUploads,
                defaultResumes,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch resume statistics');
        }
    }
    async sendNotification(sendNotificationDto, currentUser) {
        try {
            const { userIds, type, title, message, data, expiresAt, sendEmail, sendPush, sendSms, } = sendNotificationDto;
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can send notifications');
            }
            const existingUsers = await this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true },
            });
            const validUserIds = existingUsers.map((user) => user.id);
            const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));
            if (validUserIds.length === 0) {
                throw new common_1.BadRequestException('No valid users found to send notifications to');
            }
            const notificationsData = validUserIds.map((userId) => ({
                userId,
                type,
                title,
                message,
                data,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }));
            const createdNotifications = await this.prisma.notification.createMany({
                data: notificationsData,
            });
            await this.logActivity(currentUser.id, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Notification', 'bulk', `Sent ${type} notifications to ${validUserIds.length} users`, { userIds: validUserIds, type, title });
            return {
                message: `Notifications sent successfully to ${validUserIds.length} users`,
                notificationsSent: validUserIds.length,
                failedUsers: invalidUserIds,
                details: {
                    totalUsers: userIds.length,
                    successfulSends: validUserIds.length,
                    failedSends: invalidUserIds.length,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to send notifications');
        }
    }
    async broadcastNotification(broadcastNotificationDto, currentUser) {
        try {
            const { userIds, roleFilters, excludeUserIds, type, title, message, data, expiresAt, sendEmail, sendPush, sendSms, } = broadcastNotificationDto;
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can broadcast notifications');
            }
            const whereClause = {};
            if (userIds && userIds.length > 0) {
                whereClause.id = { in: userIds };
            }
            if (roleFilters && roleFilters.length > 0) {
                whereClause.role = { in: roleFilters };
            }
            if (excludeUserIds && excludeUserIds.length > 0) {
                if (whereClause.id &&
                    typeof whereClause.id === 'object' &&
                    'in' in whereClause.id) {
                    whereClause.id = {
                        in: whereClause.id.in,
                        notIn: excludeUserIds,
                    };
                }
                else {
                    whereClause.id = {
                        notIn: excludeUserIds,
                    };
                }
            }
            const totalUsers = await this.prisma.user.count({ where: whereClause });
            if (totalUsers === 0) {
                return {
                    message: 'No users found matching the specified criteria',
                    notificationsSent: 0,
                    totalUsers: 0,
                    filters: {
                        roleFilters: roleFilters || [],
                        excludeUserIds: excludeUserIds || [],
                    },
                };
            }
            const users = await this.prisma.user.findMany({
                where: whereClause,
                select: { id: true },
            });
            const notificationsData = users.map((user) => ({
                userId: user.id,
                type,
                title,
                message,
                data,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }));
            const createdNotifications = await this.prisma.notification.createMany({
                data: notificationsData,
            });
            await this.logActivity(currentUser.id, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Notification', 'broadcast', `Broadcasted ${type} notification to ${users.length} users`, {
                type,
                title,
                totalUsers: users.length,
                filters: { roleFilters, excludeUserIds },
            });
            return {
                message: `Broadcast notification sent successfully to ${users.length} users`,
                notificationsSent: users.length,
                totalUsers: users.length,
                filters: {
                    roleFilters: roleFilters || [],
                    excludeUserIds: excludeUserIds || [],
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to broadcast notifications');
        }
    }
    async getNotificationTemplates(query, currentUser) {
        try {
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can view notification templates');
            }
            const { search, type, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const whereClause = {};
            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { title: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (type) {
                whereClause.type = type;
            }
            if (isActive !== undefined) {
                whereClause.isActive = isActive;
            }
            const [templates, total] = await Promise.all([
                this.prisma.notificationTemplate.findMany({
                    where: whereClause,
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take: limit,
                }),
                this.prisma.notificationTemplate.count({ where: whereClause }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                templates: templates.map((template) => ({
                    id: template.id,
                    name: template.name,
                    description: template.description ?? undefined,
                    type: template.type,
                    title: template.title,
                    message: template.message,
                    defaultData: template.defaultData,
                    variables: template.variables,
                    isActive: template.isActive,
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt,
                })),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch notification templates');
        }
    }
    async createNotificationTemplate(createTemplateDto, currentUser) {
        try {
            const { name, description, type, title, message, defaultData, variables, isActive = true, } = createTemplateDto;
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can create notification templates');
            }
            const existingTemplate = await this.prisma.notificationTemplate.findUnique({
                where: { name },
            });
            if (existingTemplate) {
                throw new common_1.BadRequestException('A template with this name already exists');
            }
            const template = await this.prisma.notificationTemplate.create({
                data: {
                    name,
                    description,
                    type,
                    title,
                    message,
                    defaultData,
                    variables,
                    isActive,
                },
            });
            await this.logActivity(currentUser.id, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'NotificationTemplate', template.id, `Created notification template: ${name}`);
            return {
                id: template.id,
                name: template.name,
                description: template.description ?? undefined,
                type: template.type,
                title: template.title,
                message: template.message,
                defaultData: template.defaultData,
                variables: template.variables,
                isActive: template.isActive,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create notification template');
        }
    }
    async advancedCVSearch(query, currentUser) {
        try {
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can perform advanced searches');
            }
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const resumeWhere = {};
            if (query.keywords) {
                const keywords = query.keywords.trim();
                resumeWhere.AND = [
                    { extractedText: { not: null } },
                    {
                        extractedText: {
                            contains: keywords,
                            mode: 'insensitive',
                        },
                    },
                ];
            }
            else {
                resumeWhere.extractedText = { not: null };
            }
            const candidateWhere = {};
            const orConditions = [];
            if (query.candidateName) {
                orConditions.push({ firstName: { contains: query.candidateName, mode: 'insensitive' } }, { lastName: { contains: query.candidateName, mode: 'insensitive' } });
            }
            if (query.email) {
                candidateWhere.user = {
                    email: {
                        contains: query.email,
                        mode: 'insensitive',
                    },
                };
            }
            if (query.skills) {
                candidateWhere.skills = {
                    some: {
                        skillName: {
                            contains: query.skills,
                            mode: 'insensitive',
                        },
                    },
                };
            }
            if (query.location) {
                orConditions.push({ currentLocation: { contains: query.location, mode: 'insensitive' } }, {
                    city: {
                        name: { contains: query.location, mode: 'insensitive' },
                    },
                });
            }
            if (orConditions.length > 0) {
                candidateWhere.OR = orConditions;
            }
            if (query.company) {
                candidateWhere.currentCompany = {
                    contains: query.company,
                    mode: 'insensitive',
                };
            }
            if (query.minExperience !== undefined || query.maxExperience !== undefined) {
                candidateWhere.experienceYears = {};
                if (query.minExperience !== undefined) {
                    candidateWhere.experienceYears.gte = query.minExperience;
                }
                if (query.maxExperience !== undefined) {
                    candidateWhere.experienceYears.lte = query.maxExperience;
                }
            }
            if (Object.keys(candidateWhere).length > 0) {
                resumeWhere.candidate = candidateWhere;
            }
            const orderBy = {};
            if (query.sortBy) {
                if (query.sortBy.startsWith('candidate.')) {
                    orderBy.uploadedAt = query.sortOrder || 'desc';
                }
                else {
                    orderBy[query.sortBy] = query.sortOrder || 'desc';
                }
            }
            else {
                orderBy.uploadedAt = 'desc';
            }
            let resumes = [];
            let total = 0;
            try {
                [resumes, total] = await Promise.all([
                    this.prisma.resume.findMany({
                        where: resumeWhere,
                        orderBy,
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            candidateId: true,
                            fileName: true,
                            uploadedAt: true,
                            extractedText: true,
                            candidate: {
                                select: {
                                    id: true,
                                    userId: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    mobileNumber: true,
                                    currentTitle: true,
                                    experienceYears: true,
                                    currentCompany: true,
                                    currentLocation: true,
                                    expectedSalary: true,
                                    skills: {
                                        select: {
                                            skillName: true,
                                        },
                                    },
                                    city: {
                                        select: {
                                            id: true,
                                            name: true,
                                            state_name: true,
                                            country_name: true,
                                        },
                                    },
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            phone: true,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                    this.prisma.resume.count({ where: resumeWhere }),
                ]);
            }
            catch (dbError) {
                this.logger.error('Database query error in advanced CV search:', dbError);
                this.logger.error('Query where clause:', JSON.stringify(resumeWhere, null, 2));
                if (dbError.message?.includes("Can't reach database server") ||
                    dbError.message?.includes("connection") ||
                    dbError.code === 'P1001' ||
                    dbError.code === 'P1017') {
                    throw new common_1.InternalServerErrorException('Database connection error. Please check your database server connection.');
                }
                if (dbError.code?.startsWith('P')) {
                    throw new common_1.BadRequestException(`Database query error: ${dbError.message || 'Invalid query parameters'}`);
                }
                throw new common_1.InternalServerErrorException(`Database error: ${dbError.message || 'Unknown database error'}`);
            }
            const results = resumes.map((resume) => {
                const candidate = resume.candidate;
                const skills = candidate.skills.map((s) => s.skillName);
                let matchedSnippets = [];
                if (query.keywords && resume.extractedText) {
                    const snippetLength = 150;
                    const keywords = query.keywords.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
                    keywords.forEach((keyword) => {
                        const textLower = resume.extractedText.toLowerCase();
                        let startIndex = 0;
                        while (startIndex < textLower.length && matchedSnippets.length < 5) {
                            const index = textLower.indexOf(keyword, startIndex);
                            if (index === -1)
                                break;
                            const snippetStart = Math.max(0, index - snippetLength / 2);
                            const snippetEnd = Math.min(resume.extractedText.length, index + keyword.length + snippetLength / 2);
                            let snippet = resume.extractedText.substring(snippetStart, snippetEnd);
                            if (snippetStart > 0)
                                snippet = '...' + snippet;
                            if (snippetEnd < resume.extractedText.length)
                                snippet = snippet + '...';
                            matchedSnippets.push(snippet);
                            startIndex = index + keyword.length;
                            if (matchedSnippets.filter((s) => s.toLowerCase().includes(keyword)).length >= 2) {
                                break;
                            }
                        }
                    });
                }
                return {
                    candidateId: candidate.id,
                    userId: candidate.userId || candidate.user?.id || undefined,
                    firstName: candidate.firstName,
                    lastName: candidate.lastName,
                    email: candidate.email || candidate.user?.email || 'N/A',
                    phone: candidate.mobileNumber || candidate.user?.phone || undefined,
                    currentTitle: candidate.currentTitle || undefined,
                    experienceYears: candidate.experienceYears || undefined,
                    currentCompany: candidate.currentCompany || undefined,
                    currentLocation: candidate.currentLocation || candidate.city?.name || undefined,
                    expectedSalary: candidate.expectedSalary ? Number(candidate.expectedSalary) : undefined,
                    skills,
                    resumeId: resume.id,
                    resumeFileName: resume.fileName,
                    resumeUploadedAt: resume.uploadedAt,
                    matchedSnippets: matchedSnippets.length > 0 ? matchedSnippets : undefined,
                };
            });
            const totalPages = Math.ceil(total / limit);
            return {
                results,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                searchQuery: {
                    keywords: query.keywords,
                    skills: query.skills,
                    location: query.location,
                    company: query.company,
                    minExperience: query.minExperience,
                    maxExperience: query.maxExperience,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Advanced CV search failed:', error);
            this.logger.error('Error details:', {
                message: error.message,
                stack: error.stack,
                query,
                errorName: error?.constructor?.name,
            });
            if (error?.code === 'P2002') {
                throw new common_1.BadRequestException('Database constraint violation');
            }
            else if (error?.code === 'P2025') {
                throw new common_1.NotFoundException('Record not found');
            }
            else if (error?.message?.includes('Invalid')) {
                throw new common_1.BadRequestException(`Invalid query: ${error.message}`);
            }
            throw new common_1.InternalServerErrorException(`Failed to perform advanced CV search: ${error.message || 'Unknown error'}`);
        }
    }
    async extractTextFromAllResumes(currentUser) {
        try {
            if (currentUser.role !== client_1.UserRole.ADMIN &&
                currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
                throw new common_1.ForbiddenException('Only admins can extract resume text');
            }
            const resumes = await this.prisma.resume.findMany({
                where: {
                    OR: [
                        { extractedText: null },
                        { extractedText: '' },
                    ],
                    mimeType: {
                        contains: 'pdf',
                        mode: 'insensitive',
                    },
                },
                select: {
                    id: true,
                    filePath: true,
                    fileName: true,
                    mimeType: true,
                },
            });
            this.logger.log(`Found ${resumes.length} resumes without extracted text`);
            let successful = 0;
            let failed = 0;
            const batchSize = 10;
            for (let i = 0; i < resumes.length; i += batchSize) {
                const batch = resumes.slice(i, i + batchSize);
                await Promise.all(batch.map(async (resume) => {
                    try {
                        const fileUrl = resume.filePath.startsWith('http')
                            ? resume.filePath
                            : `https://spearwin.sfo3.digitaloceanspaces.com/${resume.filePath}`;
                        const extractedText = await this.pdfExtractor.extractTextFromPDF(fileUrl);
                        if (extractedText && extractedText.length > 0) {
                            const cleanedText = this.pdfExtractor.cleanExtractedText(extractedText);
                            await this.prisma.resume.update({
                                where: { id: resume.id },
                                data: { extractedText: cleanedText },
                            });
                            successful++;
                            this.logger.log(`Successfully extracted ${cleanedText.length} characters from ${resume.fileName}`);
                        }
                        else {
                            this.logger.warn(`No text extracted from ${resume.fileName}`);
                            failed++;
                        }
                    }
                    catch (error) {
                        this.logger.error(`Failed to extract text from resume ${resume.id}: ${error.message}`);
                        failed++;
                    }
                }));
            }
            return {
                message: `Text extraction completed. ${successful} successful, ${failed} failed.`,
                total: resumes.length,
                processed: successful + failed,
                successful,
                failed,
            };
        }
        catch (error) {
            this.logger.error('Error extracting text from resumes:', error);
            throw new common_1.InternalServerErrorException(`Failed to extract text from resumes: ${error.message}`);
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        pdf_extractor_service_1.PdfExtractorService])
], AdminService);
//# sourceMappingURL=admin.service.js.map