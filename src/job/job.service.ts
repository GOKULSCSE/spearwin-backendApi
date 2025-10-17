import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JobQueryDto, JobSearchDto } from './dto/job-query.dto';
import {
  JobResponseDto,
  JobListResponseDto,
  JobFiltersResponseDto,
  JobViewResponseDto,
} from './dto/job-response.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApplyForJobDto,
  ApplicationResponseDto,
} from '../candidate/dto/job-application.dto';
import {
  CreateJobAttributeDto,
  UpdateJobAttributeDto,
  JobAttributeQueryDto,
  JobAttributeResponseDto,
  JobAttributeListResponseDto,
  JobAttributeCategoriesResponseDto,
  BulkCreateJobAttributesDto,
} from './dto/job-attribute.dto';
import { JobAttributeCategory } from '@prisma/client';
import { Prisma, LogAction, LogLevel } from '@prisma/client';

@Injectable()
export class JobService {
  constructor(private readonly db: DatabaseService) {}

  // =================================================================
  // PUBLIC JOB LISTINGS
  // =================================================================

  async getPublishedJobs(query: JobQueryDto): Promise<JobListResponseDto> {
    try {
      const {
        search,
        company,
        city,
        type,
        experience,
        salary_min,
        salary_max,
        skills,
        remote,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.JobWhereInput = {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      };

      // Add search filter
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { requirements: { contains: search, mode: 'insensitive' } },
          { responsibilities: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Add company filter
      if (company) {
        where.companyId = company;
      }

      // Add city filter
      if (city) {
        where.cityId = parseInt(city);
      }

      // Add job type filter
      if (type) {
        where.jobType = type as any;
      }

      // Add experience level filter
      if (experience) {
        where.experienceLevel = experience as any;
      }

      // Add salary filters
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

      // Add skills filter
      if (skills && skills.length > 0) {
        where.skillsRequired = {
          hasSome: skills,
        };
      }

      // Add remote filter
      if (remote !== undefined) {
        where.workMode = remote ? 'REMOTE' : 'ONSITE';
      }

      // Build order by clause
      const orderBy: Prisma.JobOrderByWithRelationInput = {};
      if (sortBy === 'title') {
        orderBy.title = sortOrder;
      } else if (sortBy === 'salaryMin') {
        orderBy.minSalary = sortOrder;
      } else if (sortBy === 'publishedAt') {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get jobs with pagination
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
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async searchJobs(searchQuery: JobSearchDto): Promise<JobListResponseDto> {
    try {
      const {
        q,
        location,
        type,
        experience,
        salary_min,
        skills,
        remote,
        page = 1,
        limit = 20,
      } = searchQuery;

      const skip = (page - 1) * limit;

      // Build where clause for advanced search
      const where: Prisma.JobWhereInput = {
        status: 'PUBLISHED',
        publishedAt: { not: null },
      };

      // Add text search
      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { requirements: { contains: q, mode: 'insensitive' } },
          { responsibilities: { contains: q, mode: 'insensitive' } },
          { benefits: { contains: q, mode: 'insensitive' } },
        ];
      }

      // Add location search
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

      // Add other filters
      if (type) {
        where.jobType = type as any;
      }

      if (experience) {
        where.experienceLevel = experience as any;
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

      // Get jobs with pagination
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
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getFeaturedJobs(): Promise<JobResponseDto[]> {
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
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getJobBySlug(slug: string): Promise<JobResponseDto> {
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
        throw new NotFoundException('Job not found');
      }

      return this.mapJobToResponse(job);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async incrementJobView(jobId: string): Promise<JobViewResponseDto> {
    try {
      const job = await this.db.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, viewCount: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getJobFilters(): Promise<JobFiltersResponseDto> {
    try {
      const [
        companies,
        locations,
        jobTypes,
        experienceLevels,
        workModes,
        skills,
        salaryRanges,
      ] = await Promise.all([
        // Get companies with published jobs
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

        // Get locations with published jobs
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

        // Get unique job types
        this.db.job.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { not: null },
          },
          select: { jobType: true },
          distinct: ['jobType'],
        }),

        // Get unique experience levels
        this.db.job.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { not: null },
          },
          select: { experienceLevel: true },
          distinct: ['experienceLevel'],
        }),

        // Get unique work modes
        this.db.job.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { not: null },
          },
          select: { workMode: true },
          distinct: ['workMode'],
        }),

        // Get skills from published jobs
        this.db.job.findMany({
          where: {
            status: 'PUBLISHED',
            publishedAt: { not: null },
          },
          select: {
            skillsRequired: true,
          },
        }),

        // Get salary ranges
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
        skills: [], // Will be processed from skillsRequired
        salaryRanges: {
          min: Number(salaryRanges._min.minSalary) || 0,
          max: Number(salaryRanges._max.maxSalary) || 0,
        },
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // JOB MANAGEMENT
  // =================================================================

  async updateJob(
    jobId: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    try {
      // Check if job exists
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
        throw new NotFoundException('Job not found');
      }

      // Prepare update data
      const updateData: any = {};

      // Only update fields that are provided
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
      if (updateJobDto.tags !== undefined) updateData.tags = updateJobDto.tags;
      if (updateJobDto.applicationDeadline !== undefined) {
        updateData.applicationDeadline = new Date(
          updateJobDto.applicationDeadline,
        );
      }
      if (updateJobDto.status !== undefined)
        updateData.status = updateJobDto.status;

      // Update the job
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // HELPER METHODS
  // =================================================================

  private mapJobToResponse(job: any): JobResponseDto {
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

  // =================================================================
  // JOB APPLICATIONS
  // =================================================================

  async applyForJob(
    jobId: string,
    userId: string,
    applyDto: ApplyForJobDto,
  ): Promise<ApplicationResponseDto> {
    try {
      // Check if job exists and is published
      const job = await this.db.job.findFirst({
        where: {
          id: jobId,
          status: 'PUBLISHED',
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found or not published');
      }

      // Get candidate profile
      const candidate = await this.db.candidate.findFirst({
        where: { userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      // Check if already applied
      const existingApplication = await this.db.jobApplication.findFirst({
        where: {
          jobId,
          candidateId: candidate.id,
        },
      });

      if (existingApplication) {
        throw new BadRequestException('You have already applied for this job');
      }

      // Validate resume if provided
      if (applyDto.resumeId) {
        const resume = await this.db.resume.findFirst({
          where: {
            id: applyDto.resumeId,
            candidateId: candidate.id,
          },
        });

        if (!resume) {
          throw new BadRequestException(
            'Resume not found or does not belong to you',
          );
        }
      }

      // Create application
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

      // Update job application count
      await this.db.job.update({
        where: { id: jobId },
        data: {
          applicationCount: {
            increment: 1,
          },
        },
      });

      // Log the application
      await this.logActivity(
        userId,
        LogAction.APPLY,
        LogLevel.INFO,
        'JobApplication',
        application.id,
        `Applied for job: ${job.title}`,
      );

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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  private async logActivity(
    userId: string,
    action: LogAction,
    level: LogLevel,
    entity: string,
    entityId: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  private handleException(error: any): void {
    throw new InternalServerErrorException("Can't process job request");
  }

  // =================================================================
  // JOB ATTRIBUTES MANAGEMENT
  // =================================================================

  async createJobAttribute(
    createJobAttributeDto: CreateJobAttributeDto,
  ): Promise<JobAttributeResponseDto> {
    try {
      // Check if attribute with same name and category already exists
      const existingAttribute = await this.db.jobAttribute.findFirst({
        where: {
          name: createJobAttributeDto.name,
          category: createJobAttributeDto.category as any,
        },
      });

      if (existingAttribute) {
        throw new BadRequestException(
          `Job attribute with name "${createJobAttributeDto.name}" already exists in category "${createJobAttributeDto.category}"`,
        );
      }

      const jobAttribute = await this.db.jobAttribute.create({
        data: {
          name: createJobAttributeDto.name,
          category: createJobAttributeDto.category as any,
          description: createJobAttributeDto.description,
          isActive: createJobAttributeDto.isActive ?? true,
          sortOrder: createJobAttributeDto.sortOrder ?? 0,
        },
      });

      return {
        id: jobAttribute.id,
        name: jobAttribute.name,
        category: jobAttribute.category as any,
        description: jobAttribute.description,
        isActive: jobAttribute.isActive,
        sortOrder: jobAttribute.sortOrder,
        createdAt: jobAttribute.createdAt,
        updatedAt: jobAttribute.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create job attribute',
      );
    }
  }

  async updateJobAttribute(
    id: string,
    updateJobAttributeDto: UpdateJobAttributeDto,
  ): Promise<JobAttributeResponseDto> {
    try {
      // Check if attribute exists
      const existingAttribute = await this.db.jobAttribute.findUnique({
        where: { id },
      });

      if (!existingAttribute) {
        throw new NotFoundException('Job attribute not found');
      }

      // Check for name conflicts if name is being updated
      if (updateJobAttributeDto.name && updateJobAttributeDto.name !== existingAttribute.name) {
        const conflictingAttribute = await this.db.jobAttribute.findFirst({
          where: {
            name: updateJobAttributeDto.name,
            category: (updateJobAttributeDto.category || existingAttribute.category) as any,
            id: { not: id },
          },
        });

        if (conflictingAttribute) {
          throw new BadRequestException(
            `Job attribute with name "${updateJobAttributeDto.name}" already exists in category "${updateJobAttributeDto.category || existingAttribute.category}"`,
          );
        }
      }

      const updatedAttribute = await this.db.jobAttribute.update({
        where: { id },
        data: {
          ...updateJobAttributeDto,
          category: updateJobAttributeDto.category as any,
        },
      });

      return {
        id: updatedAttribute.id,
        name: updatedAttribute.name,
        category: updatedAttribute.category as any,
        description: updatedAttribute.description,
        isActive: updatedAttribute.isActive,
        sortOrder: updatedAttribute.sortOrder,
        createdAt: updatedAttribute.createdAt,
        updatedAt: updatedAttribute.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update job attribute',
      );
    }
  }

  async deleteJobAttribute(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const existingAttribute = await this.db.jobAttribute.findUnique({
        where: { id },
      });

      if (!existingAttribute) {
        throw new NotFoundException('Job attribute not found');
      }

      await this.db.jobAttribute.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Job attribute deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete job attribute',
      );
    }
  }

  async getJobAttribute(id: string): Promise<JobAttributeResponseDto> {
    try {
      const jobAttribute = await this.db.jobAttribute.findUnique({
        where: { id },
      });

      if (!jobAttribute) {
        throw new NotFoundException('Job attribute not found');
      }

      return {
        id: jobAttribute.id,
        name: jobAttribute.name,
        category: jobAttribute.category as any,
        description: jobAttribute.description,
        isActive: jobAttribute.isActive,
        sortOrder: jobAttribute.sortOrder,
        createdAt: jobAttribute.createdAt,
        updatedAt: jobAttribute.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get job attribute',
      );
    }
  }

  async getJobAttributes(
    query: JobAttributeQueryDto,
  ): Promise<JobAttributeListResponseDto> {
    try {
      const {
        category,
        isActive,
        search,
        page = 1,
        limit = 20,
        sortBy = 'sortOrder',
        sortOrder = 'asc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.JobAttributeWhereInput = {};

      if (category) {
        where.category = category as any;
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

      // Get total count
      const total = await this.db.jobAttribute.count({ where });

      // Get attributes
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
          category: attr.category as any,
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get job attributes',
      );
    }
  }

  async getJobAttributesByCategory(): Promise<JobAttributeCategoriesResponseDto> {
    try {
      const categories = Object.values(JobAttributeCategory);
      const result: { category: JobAttributeCategory; attributes: JobAttributeResponseDto[] }[] = [];

      for (const category of categories) {
        const attributes = await this.db.jobAttribute.findMany({
          where: {
            category: category as JobAttributeCategory,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        });

        result.push({
          category: category as any,
          attributes: attributes.map((attr) => ({
            id: attr.id,
            name: attr.name,
            category: attr.category as any,
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
        data: result as any,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get job attributes by category',
      );
    }
  }

  async bulkCreateJobAttributes(
    bulkCreateDto: BulkCreateJobAttributesDto,
  ): Promise<{ success: boolean; message: string; created: number }> {
    try {
      const { category, attributes } = bulkCreateDto;

      // Check for existing attributes to avoid duplicates
      const existingNames = await this.db.jobAttribute.findMany({
        where: {
          category: category as any,
          name: { in: attributes.map((attr) => attr.name) },
        },
        select: { name: true },
      });

      const existingNamesSet = new Set(existingNames.map((attr) => attr.name));
      const newAttributes = attributes.filter(
        (attr) => !existingNamesSet.has(attr.name),
      );

      if (newAttributes.length === 0) {
        throw new BadRequestException(
          'All attributes already exist in this category',
        );
      }

      // Create new attributes
      const createdAttributes = await this.db.jobAttribute.createMany({
        data: newAttributes.map((attr) => ({
          name: attr.name,
          category: category as any,
          description: attr.description,
          sortOrder: attr.sortOrder ?? 0,
        })),
      });

      return {
        success: true,
        message: `Successfully created ${createdAttributes.count} job attributes`,
        created: createdAttributes.count,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to bulk create job attributes',
      );
    }
  }
}
