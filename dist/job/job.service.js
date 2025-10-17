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
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
let JobService = class JobService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPublishedJobs(query) {
        try {
            const { search, company, city, type, experience, salary_min, salary_max, skills, remote, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const skip = (page - 1) * limit;
            const where = {
                status: 'PUBLISHED',
                publishedAt: { not: null },
            };
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { requirements: { contains: search, mode: 'insensitive' } },
                    { responsibilities: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (company) {
                where.companyId = company;
            }
            if (city) {
                where.cityId = parseInt(city);
            }
            if (type) {
                where.jobType = type;
            }
            if (experience) {
                where.experienceLevel = experience;
            }
            if (salary_min !== undefined || salary_max !== undefined) {
                where.OR = [
                    ...(where.OR || []),
                    {
                        AND: [
                            salary_min !== undefined
                                ? { minSalary: { gte: salary_min } }
                                : {},
                            salary_max !== undefined
                                ? { maxSalary: { lte: salary_max } }
                                : {},
                        ],
                    },
                ];
            }
            if (skills && skills.length > 0) {
                where.skillsRequired = {
                    hasSome: skills,
                };
            }
            if (remote !== undefined) {
                where.workMode = remote ? 'REMOTE' : 'ONSITE';
            }
            const orderBy = {};
            if (sortBy === 'title') {
                orderBy.title = sortOrder;
            }
            else if (sortBy === 'salaryMin') {
                orderBy.minSalary = sortOrder;
            }
            else if (sortBy === 'publishedAt') {
                orderBy.createdAt = sortOrder;
            }
            else {
                orderBy.createdAt = sortOrder;
            }
            const [jobs, total] = await Promise.all([
                this.db.job.findMany({
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
                this.db.job.count({ where }),
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
            this.handleException(error);
            throw error;
        }
    }
    async searchJobs(searchQuery) {
        try {
            const { q, location, type, experience, salary_min, skills, remote, page = 1, limit = 20, } = searchQuery;
            const skip = (page - 1) * limit;
            const where = {
                status: 'PUBLISHED',
                publishedAt: { not: null },
            };
            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    { requirements: { contains: q, mode: 'insensitive' } },
                    { responsibilities: { contains: q, mode: 'insensitive' } },
                    { benefits: { contains: q, mode: 'insensitive' } },
                ];
            }
            if (location) {
                where.OR = [
                    ...(where.OR || []),
                    {
                        city: {
                            name: { contains: location, mode: 'insensitive' },
                        },
                    },
                    {
                        city: {
                            state: {
                                name: { contains: location, mode: 'insensitive' },
                            },
                        },
                    },
                    {
                        city: {
                            state: {
                                country: {
                                    name: { contains: location, mode: 'insensitive' },
                                },
                            },
                        },
                    },
                ];
            }
            if (type) {
                where.jobType = type;
            }
            if (experience) {
                where.experienceLevel = experience;
            }
            if (salary_min !== undefined) {
                where.minSalary = { gte: salary_min };
            }
            if (skills && skills.length > 0) {
                where.skillsRequired = {
                    hasSome: skills,
                };
            }
            if (remote !== undefined) {
                where.workMode = remote ? 'REMOTE' : 'ONSITE';
            }
            const [jobs, total] = await Promise.all([
                this.db.job.findMany({
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
                    orderBy: { publishedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.db.job.count({ where }),
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
            this.handleException(error);
            throw error;
        }
    }
    async getFeaturedJobs() {
        try {
            const jobs = await this.db.job.findMany({
                where: {
                    status: 'PUBLISHED',
                    publishedAt: { not: null },
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
                orderBy: { publishedAt: 'desc' },
                take: 10,
            });
            return jobs.map((job) => this.mapJobToResponse(job));
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async getJobBySlug(slug) {
        try {
            const job = await this.db.job.findFirst({
                where: {
                    slug,
                    status: 'PUBLISHED',
                    publishedAt: { not: null },
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
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
        }
    }
    async incrementJobView(jobId) {
        try {
            const job = await this.db.job.findUnique({
                where: { id: jobId },
                select: { id: true, title: true, viewCount: true },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found');
            }
            const updatedJob = await this.db.job.update({
                where: { id: jobId },
                data: {
                    viewCount: { increment: 1 },
                },
                select: { viewCount: true },
            });
            return {
                message: 'Job view count updated successfully',
                viewCount: updatedJob.viewCount,
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
    async getJobFilters() {
        try {
            const [companies, locations, jobTypes, experienceLevels, workModes, skills, salaryRanges,] = await Promise.all([
                this.db.company.findMany({
                    where: {
                        jobs: {
                            some: {
                                status: 'PUBLISHED',
                                publishedAt: { not: null },
                            },
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                    },
                    orderBy: { name: 'asc' },
                }),
                this.db.city.findMany({
                    where: {
                        jobs: {
                            some: {
                                status: 'PUBLISHED',
                                publishedAt: { not: null },
                            },
                        },
                    },
                    include: {
                        state: {
                            include: {
                                country: true,
                            },
                        },
                    },
                    orderBy: { name: 'asc' },
                }),
                this.db.job.findMany({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                    },
                    select: { jobType: true },
                    distinct: ['jobType'],
                }),
                this.db.job.findMany({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                    },
                    select: { experienceLevel: true },
                    distinct: ['experienceLevel'],
                }),
                this.db.job.findMany({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                    },
                    select: { workMode: true },
                    distinct: ['workMode'],
                }),
                this.db.job.findMany({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                    },
                    select: {
                        skillsRequired: true,
                    },
                }),
                this.db.job.aggregate({
                    where: {
                        status: 'PUBLISHED',
                        publishedAt: { not: null },
                        minSalary: { not: null },
                        maxSalary: { not: null },
                    },
                    _min: { minSalary: true },
                    _max: { maxSalary: true },
                }),
            ]);
            return {
                companies: companies.map((company) => ({
                    id: Number(company.id),
                    name: company.name,
                    logo: company.logo,
                })),
                locations: locations.map((location) => ({
                    id: location.id,
                    name: location.name,
                    state: location.state.name,
                    country: location.state.country?.name || 'Unknown',
                })),
                jobTypes: jobTypes.map((job) => job.jobType),
                experienceLevels: experienceLevels.map((job) => job.experienceLevel),
                workModes: workModes.map((job) => job.workMode),
                skills: [],
                salaryRanges: {
                    min: Number(salaryRanges._min.minSalary) || 0,
                    max: Number(salaryRanges._max.maxSalary) || 0,
                },
            };
        }
        catch (error) {
            this.handleException(error);
            throw error;
        }
    }
    async updateJob(jobId, updateJobDto) {
        try {
            const existingJob = await this.db.job.findUnique({
                where: { id: jobId },
                include: {
                    company: true,
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
            if (updateJobDto.minSalary !== undefined)
                updateData.minSalary = updateJobDto.minSalary;
            if (updateJobDto.maxSalary !== undefined)
                updateData.maxSalary = updateJobDto.maxSalary;
            if (updateJobDto.currency !== undefined)
                updateData.currency = updateJobDto.currency;
            if (updateJobDto.jobType !== undefined)
                updateData.jobType = updateJobDto.jobType;
            if (updateJobDto.workMode !== undefined)
                updateData.workMode = updateJobDto.workMode;
            if (updateJobDto.experienceLevel !== undefined)
                updateData.experienceLevel = updateJobDto.experienceLevel;
            if (updateJobDto.companyId !== undefined)
                updateData.companyId = updateJobDto.companyId;
            if (updateJobDto.cityId !== undefined)
                updateData.cityId = updateJobDto.cityId;
            if (updateJobDto.skillsRequired !== undefined)
                updateData.skillsRequired = updateJobDto.skillsRequired;
            if (updateJobDto.tags !== undefined)
                updateData.tags = updateJobDto.tags;
            if (updateJobDto.applicationDeadline !== undefined) {
                updateData.applicationDeadline = new Date(updateJobDto.applicationDeadline);
            }
            if (updateJobDto.status !== undefined)
                updateData.status = updateJobDto.status;
            const updatedJob = await this.db.job.update({
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
            return this.mapJobToResponse(updatedJob);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.handleException(error);
            throw error;
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
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            currency: job.currency,
            jobType: job.jobType,
            workMode: job.workMode,
            experienceLevel: job.experienceLevel,
            status: job.status,
            isRemote: job.workMode === 'REMOTE',
            viewCount: job.viewCount,
            applicationCount: job.applicationCount,
            applicationDeadline: job.applicationDeadline,
            publishedAt: job.publishedAt,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            company: job.company,
            location: job.city
                ? {
                    city: {
                        id: job.city.id,
                        name: job.city.name,
                        state: {
                            id: job.city.state.id,
                            name: job.city.state.name,
                            iso2: job.city.state.iso2,
                            country: {
                                id: job.city.state.country.id,
                                name: job.city.state.country.name,
                                iso2: job.city.state.country.iso2,
                            },
                        },
                    },
                }
                : null,
            skillsRequired: job.skillsRequired || [],
            tags: job.tags || [],
        };
    }
    async applyForJob(jobId, userId, applyDto) {
        try {
            const job = await this.db.job.findFirst({
                where: {
                    id: jobId,
                    status: 'PUBLISHED',
                },
            });
            if (!job) {
                throw new common_1.NotFoundException('Job not found or not published');
            }
            const candidate = await this.db.candidate.findFirst({
                where: { userId },
            });
            if (!candidate) {
                throw new common_1.NotFoundException('Candidate profile not found');
            }
            const existingApplication = await this.db.jobApplication.findFirst({
                where: {
                    jobId,
                    candidateId: candidate.id,
                },
            });
            if (existingApplication) {
                throw new common_1.BadRequestException('You have already applied for this job');
            }
            if (applyDto.resumeId) {
                const resume = await this.db.resume.findFirst({
                    where: {
                        id: applyDto.resumeId,
                        candidateId: candidate.id,
                    },
                });
                if (!resume) {
                    throw new common_1.BadRequestException('Resume not found or does not belong to you');
                }
            }
            const application = await this.db.jobApplication.create({
                data: {
                    jobId,
                    candidateId: candidate.id,
                    resumeId: applyDto.resumeId,
                    coverLetter: applyDto.coverLetter,
                    status: 'APPLIED',
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
            await this.db.job.update({
                where: { id: jobId },
                data: {
                    applicationCount: {
                        increment: 1,
                    },
                },
            });
            await this.logActivity(userId, client_2.LogAction.APPLY, client_2.LogLevel.INFO, 'JobApplication', application.id, `Applied for job: ${job.title}`);
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
                                    country: application.job.city.state.country ? {
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
                                    } : undefined,
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
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
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
        throw new common_1.InternalServerErrorException("Can't process job request");
    }
    async createJobAttribute(createJobAttributeDto) {
        try {
            const existingAttribute = await this.db.jobAttribute.findFirst({
                where: {
                    name: createJobAttributeDto.name,
                    category: createJobAttributeDto.category,
                },
            });
            if (existingAttribute) {
                throw new common_1.BadRequestException(`Job attribute with name "${createJobAttributeDto.name}" already exists in category "${createJobAttributeDto.category}"`);
            }
            const jobAttribute = await this.db.jobAttribute.create({
                data: {
                    name: createJobAttributeDto.name,
                    category: createJobAttributeDto.category,
                    description: createJobAttributeDto.description,
                    isActive: createJobAttributeDto.isActive ?? true,
                    sortOrder: createJobAttributeDto.sortOrder ?? 0,
                },
            });
            return {
                id: jobAttribute.id,
                name: jobAttribute.name,
                category: jobAttribute.category,
                description: jobAttribute.description,
                isActive: jobAttribute.isActive,
                sortOrder: jobAttribute.sortOrder,
                createdAt: jobAttribute.createdAt,
                updatedAt: jobAttribute.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create job attribute');
        }
    }
    async updateJobAttribute(id, updateJobAttributeDto) {
        try {
            const existingAttribute = await this.db.jobAttribute.findUnique({
                where: { id },
            });
            if (!existingAttribute) {
                throw new common_1.NotFoundException('Job attribute not found');
            }
            if (updateJobAttributeDto.name && updateJobAttributeDto.name !== existingAttribute.name) {
                const conflictingAttribute = await this.db.jobAttribute.findFirst({
                    where: {
                        name: updateJobAttributeDto.name,
                        category: (updateJobAttributeDto.category || existingAttribute.category),
                        id: { not: id },
                    },
                });
                if (conflictingAttribute) {
                    throw new common_1.BadRequestException(`Job attribute with name "${updateJobAttributeDto.name}" already exists in category "${updateJobAttributeDto.category || existingAttribute.category}"`);
                }
            }
            const updatedAttribute = await this.db.jobAttribute.update({
                where: { id },
                data: {
                    ...updateJobAttributeDto,
                    category: updateJobAttributeDto.category,
                },
            });
            return {
                id: updatedAttribute.id,
                name: updatedAttribute.name,
                category: updatedAttribute.category,
                description: updatedAttribute.description,
                isActive: updatedAttribute.isActive,
                sortOrder: updatedAttribute.sortOrder,
                createdAt: updatedAttribute.createdAt,
                updatedAt: updatedAttribute.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update job attribute');
        }
    }
    async deleteJobAttribute(id) {
        try {
            const existingAttribute = await this.db.jobAttribute.findUnique({
                where: { id },
            });
            if (!existingAttribute) {
                throw new common_1.NotFoundException('Job attribute not found');
            }
            await this.db.jobAttribute.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'Job attribute deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete job attribute');
        }
    }
    async getJobAttribute(id) {
        try {
            const jobAttribute = await this.db.jobAttribute.findUnique({
                where: { id },
            });
            if (!jobAttribute) {
                throw new common_1.NotFoundException('Job attribute not found');
            }
            return {
                id: jobAttribute.id,
                name: jobAttribute.name,
                category: jobAttribute.category,
                description: jobAttribute.description,
                isActive: jobAttribute.isActive,
                sortOrder: jobAttribute.sortOrder,
                createdAt: jobAttribute.createdAt,
                updatedAt: jobAttribute.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to get job attribute');
        }
    }
    async getJobAttributes(query) {
        try {
            const { category, isActive, search, page = 1, limit = 20, sortBy = 'sortOrder', sortOrder = 'asc', } = query;
            const skip = (page - 1) * limit;
            const where = {};
            if (category) {
                where.category = category;
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            const total = await this.db.jobAttribute.count({ where });
            const attributes = await this.db.jobAttribute.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            });
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: 'Job attributes retrieved successfully',
                data: attributes.map((attr) => ({
                    id: attr.id,
                    name: attr.name,
                    category: attr.category,
                    description: attr.description,
                    isActive: attr.isActive,
                    sortOrder: attr.sortOrder,
                    createdAt: attr.createdAt,
                    updatedAt: attr.updatedAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to get job attributes');
        }
    }
    async getJobAttributesByCategory() {
        try {
            const categories = Object.values(client_1.JobAttributeCategory);
            const result = [];
            for (const category of categories) {
                const attributes = await this.db.jobAttribute.findMany({
                    where: {
                        category: category,
                        isActive: true,
                    },
                    orderBy: { sortOrder: 'asc' },
                });
                result.push({
                    category: category,
                    attributes: attributes.map((attr) => ({
                        id: attr.id,
                        name: attr.name,
                        category: attr.category,
                        description: attr.description,
                        isActive: attr.isActive,
                        sortOrder: attr.sortOrder,
                        createdAt: attr.createdAt,
                        updatedAt: attr.updatedAt,
                    })),
                });
            }
            return {
                success: true,
                message: 'Job attributes by category retrieved successfully',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to get job attributes by category');
        }
    }
    async bulkCreateJobAttributes(bulkCreateDto) {
        try {
            const { category, attributes } = bulkCreateDto;
            const existingNames = await this.db.jobAttribute.findMany({
                where: {
                    category: category,
                    name: { in: attributes.map((attr) => attr.name) },
                },
                select: { name: true },
            });
            const existingNamesSet = new Set(existingNames.map((attr) => attr.name));
            const newAttributes = attributes.filter((attr) => !existingNamesSet.has(attr.name));
            if (newAttributes.length === 0) {
                throw new common_1.BadRequestException('All attributes already exist in this category');
            }
            const createdAttributes = await this.db.jobAttribute.createMany({
                data: newAttributes.map((attr) => ({
                    name: attr.name,
                    category: category,
                    description: attr.description,
                    sortOrder: attr.sortOrder ?? 0,
                })),
            });
            return {
                success: true,
                message: `Successfully created ${createdAttributes.count} job attributes`,
                created: createdAttributes.count,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to bulk create job attributes');
        }
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], JobService);
//# sourceMappingURL=job.service.js.map