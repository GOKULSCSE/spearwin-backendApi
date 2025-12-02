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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let CompanyService = class CompanyService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAllCompanies(query) {
        try {
            const { search, industry, country, state, city, isVerified, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { industry: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (industry) {
                where.industry = industry;
            }
            if (country) {
                where.country = { contains: country, mode: 'insensitive' };
            }
            if (state) {
                where.state = { contains: state, mode: 'insensitive' };
            }
            if (city) {
                where.city = { contains: city, mode: 'insensitive' };
            }
            if (isVerified !== undefined) {
                where.isVerified = isVerified;
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            const orderBy = {};
            orderBy[sortBy] =
                sortOrder;
            const [companies, total] = await Promise.all([
                this.db.company.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                                status: true,
                            },
                        },
                    },
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.db.company.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                companies: companies.map((company) => ({
                    id: company.id,
                    userId: company.userId,
                    name: company.name,
                    slug: company.slug,
                    description: company.description,
                    website: company.website,
                    logo: company.logo,
                    industry: company.industry,
                    foundedYear: company.foundedYear,
                    employeeCount: company.employeeCount,
                    headquarters: company.headquarters,
                    address: company.address,
                    linkedinUrl: company.linkedinUrl,
                    twitterUrl: company.twitterUrl,
                    facebookUrl: company.facebookUrl,
                    isVerified: company.isVerified,
                    isActive: company.isActive,
                    createdAt: company.createdAt,
                    updatedAt: company.updatedAt,
                    country: company.country,
                    state: company.state,
                    city: company.city,
                    user: company.user
                        ? {
                            id: company.user.id,
                            email: company.user.email,
                            role: company.user.role,
                            status: company.user.status,
                        }
                        : undefined,
                })),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getCompanyById(companyId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                        },
                    },
                },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            return {
                id: company.id,
                userId: company.userId,
                name: company.name,
                slug: company.slug,
                description: company.description,
                website: company.website,
                logo: company.logo,
                industry: company.industry,
                foundedYear: company.foundedYear,
                employeeCount: company.employeeCount,
                headquarters: company.headquarters,
                address: company.address,
                linkedinUrl: company.linkedinUrl,
                twitterUrl: company.twitterUrl,
                facebookUrl: company.facebookUrl,
                isVerified: company.isVerified,
                isActive: company.isActive,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
                country: company.country,
                state: company.state,
                city: company.city,
                user: 'user' in company && company.user
                    ? {
                        id: company.user.id,
                        email: company.user.email,
                        role: company.user.role,
                        status: company.user.status,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async createCompany(createDto, adminUserId) {
        try {
            const existingCompany = await this.db.company.findUnique({
                where: { slug: createDto.slug },
            });
            if (existingCompany) {
                throw new common_1.BadRequestException('Company with this slug already exists');
            }
            const company = await this.db.company.create({
                data: {
                    ...createDto,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                        },
                    },
                },
            });
            await this.logActivity(adminUserId, client_1.LogAction.CREATE, client_1.LogLevel.INFO, 'Company', company.id, `Company created: ${company.name}`);
            return {
                id: company.id,
                userId: company.userId,
                name: company.name,
                slug: company.slug,
                description: company.description,
                website: company.website,
                logo: company.logo,
                industry: company.industry,
                foundedYear: company.foundedYear,
                employeeCount: company.employeeCount,
                headquarters: company.headquarters,
                address: company.address,
                linkedinUrl: company.linkedinUrl,
                twitterUrl: company.twitterUrl,
                facebookUrl: company.facebookUrl,
                isVerified: company.isVerified,
                isActive: company.isActive,
                createdAt: company.createdAt,
                updatedAt: company.updatedAt,
                country: company.country,
                state: company.state,
                city: company.city,
                user: company.user
                    ? {
                        id: company.user.id,
                        email: company.user.email,
                        role: company.user.role,
                        status: company.user.status,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCompany(companyId, updateDto, adminUserId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            if (updateDto.slug && updateDto.slug !== company.slug) {
                const existingCompany = await this.db.company.findUnique({
                    where: { slug: updateDto.slug },
                });
                if (existingCompany) {
                    throw new common_1.BadRequestException('Company with this slug already exists');
                }
            }
            const updatedCompany = await this.db.company.update({
                where: { id: companyId },
                data: {
                    ...updateDto,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                        },
                    },
                },
            });
            await this.logActivity(adminUserId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Company', companyId, `Company updated: ${updatedCompany.name}`);
            return {
                id: updatedCompany.id,
                userId: updatedCompany.userId,
                name: updatedCompany.name,
                slug: updatedCompany.slug,
                description: updatedCompany.description,
                website: updatedCompany.website,
                logo: updatedCompany.logo,
                industry: updatedCompany.industry,
                foundedYear: updatedCompany.foundedYear,
                employeeCount: updatedCompany.employeeCount,
                headquarters: updatedCompany.headquarters,
                address: updatedCompany.address,
                linkedinUrl: updatedCompany.linkedinUrl,
                twitterUrl: updatedCompany.twitterUrl,
                facebookUrl: updatedCompany.facebookUrl,
                isVerified: updatedCompany.isVerified,
                isActive: updatedCompany.isActive,
                createdAt: updatedCompany.createdAt,
                updatedAt: updatedCompany.updatedAt,
                country: updatedCompany.country,
                state: updatedCompany.state,
                city: updatedCompany.city,
                user: updatedCompany.user
                    ? {
                        id: updatedCompany.user.id,
                        email: updatedCompany.user.email,
                        role: updatedCompany.user.role,
                        status: updatedCompany.user.status,
                    }
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async deleteCompany(companyId, adminUserId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            const jobCount = await this.db.job.count({
                where: { companyId },
            });
            if (jobCount > 0) {
                throw new common_1.BadRequestException('Cannot delete company with existing jobs. Please delete all jobs first.');
            }
            await this.db.company.delete({
                where: { id: companyId },
            });
            await this.logActivity(adminUserId, client_1.LogAction.DELETE, client_1.LogLevel.CRITICAL, 'Company', companyId, `Company deleted: ${company.name}`);
            return { message: 'Company deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async verifyCompany(companyId, verifyDto, adminUserId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            await this.db.company.update({
                where: { id: companyId },
                data: { isVerified: verifyDto.isVerified },
            });
            await this.logActivity(adminUserId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Company', companyId, `Company ${verifyDto.isVerified ? 'verified' : 'unverified'}: ${company.name}`);
            return {
                message: `Company ${verifyDto.isVerified ? 'verified' : 'unverified'} successfully`,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async updateCompanyStatus(companyId, statusDto, adminUserId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            await this.db.company.update({
                where: { id: companyId },
                data: { isActive: statusDto.isActive },
            });
            await this.logActivity(adminUserId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Company', companyId, `Company ${statusDto.isActive ? 'activated' : 'deactivated'}: ${company.name}`);
            return {
                message: `Company ${statusDto.isActive ? 'activated' : 'deactivated'} successfully`,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCompanyJobs(companyId, page = 1, limit = 10) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            const skip = (page - 1) * limit;
            const [jobs, total] = await Promise.all([
                this.db.job.findMany({
                    where: { companyId },
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
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.job.count({ where: { companyId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                jobs: jobs.map((job) => ({
                    id: job.id,
                    title: job.title,
                    slug: job.slug,
                    description: job.description,
                    requirements: job.requirements,
                    responsibilities: job.responsibilities,
                    benefits: job.benefits,
                    jobType: job.jobType,
                    workMode: job.workMode,
                    experienceLevel: job.experienceLevel,
                    minExperience: job.minExperience,
                    maxExperience: job.maxExperience,
                    minSalary: job.minSalary,
                    maxSalary: job.maxSalary,
                    salaryNegotiable: job.salaryNegotiable,
                    skillsRequired: job.skillsRequired,
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
                    city: job.city
                        ? {
                            id: job.city.id,
                            name: job.city.name,
                            state: {
                                id: job.city.state.id,
                                name: job.city.state.name,
                                country: job.city.state.country ? {
                                    id: job.city.state.country.id,
                                    name: job.city.state.country.name,
                                    iso2: job.city.state.country.iso2,
                                } : undefined,
                            },
                        }
                        : undefined,
                })),
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async getCompanyStats(companyId) {
        try {
            const company = await this.db.company.findUnique({
                where: { id: companyId },
            });
            if (!company) {
                throw new common_1.NotFoundException('Company not found');
            }
            const [totalJobs, activeJobs, draftJobs, closedJobs, lastJobPosted] = await Promise.all([
                this.db.job.count({ where: { companyId } }),
                this.db.job.count({ where: { companyId, status: 'PUBLISHED' } }),
                this.db.job.count({ where: { companyId, status: 'DRAFT' } }),
                this.db.job.count({ where: { companyId, status: 'CLOSED' } }),
                this.db.job.findFirst({
                    where: { companyId },
                    orderBy: { publishedAt: 'desc' },
                    select: { publishedAt: true },
                }),
            ]);
            const [totalApplications, pendingApplications, shortlistedApplications, selectedApplications, rejectedApplications,] = await Promise.all([
                this.db.jobApplication.count({
                    where: {
                        job: { companyId },
                    },
                }),
                this.db.jobApplication.count({
                    where: {
                        job: { companyId },
                        status: 'APPLIED',
                    },
                }),
                this.db.jobApplication.count({
                    where: {
                        job: { companyId },
                        status: 'SHORTLISTED',
                    },
                }),
                this.db.jobApplication.count({
                    where: {
                        job: { companyId },
                        status: 'SELECTED',
                    },
                }),
                this.db.jobApplication.count({
                    where: {
                        job: { companyId },
                        status: 'REJECTED',
                    },
                }),
            ]);
            const jobTypeStats = await this.db.job.groupBy({
                by: ['jobType'],
                where: { companyId },
                _count: { jobType: true },
                orderBy: { _count: { jobType: 'desc' } },
                take: 1,
            });
            const workModeStats = await this.db.job.groupBy({
                by: ['workMode'],
                where: { companyId },
                _count: { workMode: true },
                orderBy: { _count: { workMode: 'desc' } },
                take: 1,
            });
            const averageApplicationTime = 0;
            return {
                totalJobs,
                activeJobs,
                draftJobs,
                closedJobs,
                totalApplications,
                pendingApplications,
                shortlistedApplications,
                selectedApplications,
                rejectedApplications,
                averageApplicationTime,
                lastJobPosted: lastJobPosted?.publishedAt,
                mostPopularJobType: jobTypeStats[0]?.jobType,
                mostPopularWorkMode: workModeStats[0]?.workMode,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
        try {
            await this.db.activityLog.create({
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
    handleException(error) {
        throw new common_1.InternalServerErrorException("Can't process company request");
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CompanyService);
//# sourceMappingURL=company.service.js.map