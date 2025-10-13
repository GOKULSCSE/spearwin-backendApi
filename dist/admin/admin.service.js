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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAdmin(createAdminDto, currentUser) {
        try {
            if (currentUser.role !== client_1.UserRole.SUPER_ADMIN) {
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
                const admin = await prisma.admin.create({
                    data: {
                        userId: user.id,
                        firstName: createAdminDto.firstName,
                        lastName: createAdminDto.lastName,
                        department: createAdminDto.department,
                        designation: createAdminDto.position,
                        permissions: [],
                    },
                });
                return { user, admin };
            });
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
                        firstName: result.admin.firstName,
                        lastName: result.admin.lastName,
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
            throw new common_1.BadRequestException('Failed to create admin');
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
                        description: createCompanyDto.description,
                        website: createCompanyDto.website,
                        industry: createCompanyDto.industry,
                        foundedYear: createCompanyDto.foundedYear,
                        employeeCount: createCompanyDto.employeeCount,
                        headquarters: createCompanyDto.headquarters,
                        address: createCompanyDto.address,
                        cityId: createCompanyDto.cityId,
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
                firstName: result.firstName,
                lastName: result.lastName,
                department: result.department,
                designation: result.designation,
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
            if (sortBy === 'firstName' ||
                sortBy === 'lastName' ||
                sortBy === 'department' ||
                sortBy === 'designation') {
                orderBy[sortBy] =
                    sortOrder;
            }
            else {
                orderBy.user = {
                    [sortBy]: sortOrder,
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
                where.cityId = city;
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
                    companyId: createJobDto.companyId,
                    postedById: currentUser.id,
                    cityId: createJobDto.cityId,
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
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create job');
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
            companyId: job.companyId,
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
                            logo: app.job.company.logo || undefined,
                        },
                        location: app.job.city
                            ? {
                                city: {
                                    id: app.job.city.id,
                                    name: app.job.city.name,
                                    state: {
                                        id: app.job.city.state.id,
                                        name: app.job.city.state.name,
                                        code: app.job.city.state.code || undefined,
                                        country: {
                                            id: app.job.city.state.country.id,
                                            name: app.job.city.state.country.name,
                                            code: app.job.city.state.country.code,
                                        },
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
                        city: app.candidate.city
                            ? {
                                id: app.candidate.city.id,
                                name: app.candidate.city.name,
                                state: {
                                    id: app.candidate.city.state.id,
                                    name: app.candidate.city.state.name,
                                    code: app.candidate.city.state.code || undefined,
                                    country: {
                                        id: app.candidate.city.state.country.id,
                                        name: app.candidate.city.state.country.name,
                                        code: app.candidate.city.state.country.code,
                                    },
                                },
                            }
                            : undefined,
                    },
                    resume: app.resume
                        ? {
                            id: app.resume.id,
                            title: app.resume.title,
                            fileName: app.resume.fileName,
                            uploadedAt: app.resume.uploadedAt,
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
                        logo: application.job.company.logo || undefined,
                    },
                    location: application.job.city
                        ? {
                            city: {
                                id: application.job.city.id,
                                name: application.job.city.name,
                                state: {
                                    id: application.job.city.state.id,
                                    name: application.job.city.state.name,
                                    code: application.job.city.state.code || undefined,
                                    country: {
                                        id: application.job.city.state.country.id,
                                        name: application.job.city.state.country.name,
                                        code: application.job.city.state.country.code,
                                    },
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
                            state: {
                                id: application.candidate.city.state.id,
                                name: application.candidate.city.state.name,
                                code: application.candidate.city.state.code || undefined,
                                country: {
                                    id: application.candidate.city.state.country.id,
                                    name: application.candidate.city.state.country.name,
                                    code: application.candidate.city.state.country.code,
                                },
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
                        logo: updatedApplication.job.company.logo || undefined,
                    },
                    location: updatedApplication.job.city
                        ? {
                            city: {
                                id: updatedApplication.job.city.id,
                                name: updatedApplication.job.city.name,
                                state: {
                                    id: updatedApplication.job.city.state.id,
                                    name: updatedApplication.job.city.state.name,
                                    code: updatedApplication.job.city.state.code || undefined,
                                    country: {
                                        id: updatedApplication.job.city.state.country.id,
                                        name: updatedApplication.job.city.state.country.name,
                                        code: updatedApplication.job.city.state.country.code,
                                    },
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
                            state: {
                                id: updatedApplication.candidate.city.state.id,
                                name: updatedApplication.candidate.city.state.name,
                                code: updatedApplication.candidate.city.state.code || undefined,
                                country: {
                                    id: updatedApplication.candidate.city.state.country.id,
                                    name: updatedApplication.candidate.city.state.country.name,
                                    code: updatedApplication.candidate.city.state.country.code,
                                },
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
                        logo: updatedApplication.job.company.logo || undefined,
                    },
                    location: updatedApplication.job.city
                        ? {
                            city: {
                                id: updatedApplication.job.city.id,
                                name: updatedApplication.job.city.name,
                                state: {
                                    id: updatedApplication.job.city.state.id,
                                    name: updatedApplication.job.city.state.name,
                                    code: updatedApplication.job.city.state.code || undefined,
                                    country: {
                                        id: updatedApplication.job.city.state.country.id,
                                        name: updatedApplication.job.city.state.country.name,
                                        code: updatedApplication.job.city.state.country.code,
                                    },
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
                            state: {
                                id: updatedApplication.candidate.city.state.id,
                                name: updatedApplication.candidate.city.state.name,
                                code: updatedApplication.candidate.city.state.code || undefined,
                                country: {
                                    id: updatedApplication.candidate.city.state.country.id,
                                    name: updatedApplication.candidate.city.state.country.name,
                                    code: updatedApplication.candidate.city.state.country.code,
                                },
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
                Company: app.job.company.name,
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
                Location: app.job.city
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AdminService);
//# sourceMappingURL=admin.service.js.map