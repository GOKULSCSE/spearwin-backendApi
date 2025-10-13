import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateAdminProfileDto, AdminProfileResponseDto } from './dto/admin-profile.dto';
import { AdminListQueryDto, AdminListResponseDto } from './dto/admin-list.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { 
  CreateJobDto, 
  UpdateJobDto, 
  JobListQueryDto, 
  JobStatsResponseDto, 
  JobApplicationsResponseDto 
} from './dto/admin-job.dto';
import { 
  UpdateApplicationStatusDto, 
  AddApplicationFeedbackDto, 
  ApplicationQueryDto, 
  AdminApplicationResponseDto, 
  ApplicationsListResponseDto, 
  ApplicationStatsResponseDto,
  BulkUpdateApplicationsDto,
  BulkUpdateResponseDto,
  BulkExportQueryDto,
  BulkExportResponseDto
} from './dto/admin-application.dto';
import {
  ResumeQueryDto,
  AdminResumeResponseDto,
  ResumesListResponseDto,
  ResumeStatsResponseDto,
  BulkDownloadDto,
  BulkDownloadResponseDto
} from './dto/admin-resume.dto';
import {
  SendNotificationDto,
  BroadcastNotificationDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  NotificationTemplateResponseDto,
  SendNotificationResponseDto,
  BroadcastNotificationResponseDto,
  NotificationTemplatesListResponseDto,
  NotificationQueryDto
} from './dto/admin-notification.dto';
import { 
  CreateAdminResponseDto, 
  CreateCompanyResponseDto, 
  UpdatePermissionsResponseDto 
} from './dto/admin-response.dto';
import { UserRole, UserStatus, LogAction, LogLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: DatabaseService) {}

  async createAdmin(createAdminDto: CreateAdminDto, currentUser: any): Promise<CreateAdminResponseDto> {
    try {
      // Check if current user is SUPER_ADMIN
      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can create admins');
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createAdminDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Check if phone number is provided and already exists
      if (createAdminDto.phone) {
        const existingPhoneUser = await this.prisma.user.findUnique({
          where: { phone: createAdminDto.phone },
        });

        if (existingPhoneUser) {
          throw new BadRequestException('User with this phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

      // Create user and admin in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: createAdminDto.email,
            password: hashedPassword,
            phone: createAdminDto.phone,
            role: createAdminDto.role as UserRole,
            status: UserStatus.ACTIVE, // Admin accounts are active by default
            emailVerified: true, // Admin emails are considered verified
            phoneVerified: createAdminDto.phone ? true : false,
            profileCompleted: true,
            twoFactorEnabled: false,
          },
        });

        // Create admin profile
        const admin = await prisma.admin.create({
          data: {
            userId: user.id,
            firstName: createAdminDto.firstName,
            lastName: createAdminDto.lastName,
            department: createAdminDto.department,
            designation: createAdminDto.position, // Map position to designation
            permissions: [], // Default empty permissions
          },
        });

        return { user, admin };
      });

      // Log activity
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
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create admin');
    }
  }

  async createCompany(createCompanyDto: CreateCompanyDto, currentUser: any): Promise<CreateCompanyResponseDto> {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can create company profiles');
      }

      // Generate unique email for company user
      const companyEmail = `company-${uuidv4()}@spearwin.com`;
      const hashedPassword = await bcrypt.hash(uuidv4(), 10); // Random password

      // Generate unique slug for company
      const slug = createCompanyDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

      // Create user and company in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: companyEmail,
            password: hashedPassword,
            role: UserRole.COMPANY,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            phoneVerified: false,
            profileCompleted: true,
            twoFactorEnabled: false,
          },
        });

        // Create company profile
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
            isVerified: createCompanyDto.isVerified ?? true, // Admin-created companies are verified by default
            isActive: createCompanyDto.isActive ?? true,
          },
        });

        return { user, company };
      });

      // Log activity
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
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create company profile');
    }
  }

  async updatePermissions(updatePermissionsDto: UpdatePermissionsDto, currentUser: any): Promise<UpdatePermissionsResponseDto> {
    try {
      // Check if current user is SUPER_ADMIN
      if (currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can update admin permissions');
      }

      // Find the admin to update
      const admin = await this.prisma.admin.findUnique({
        where: { id: updatePermissionsDto.adminId },
        include: { user: true },
      });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      // Prevent updating SUPER_ADMIN permissions
      if (admin.user.role === UserRole.SUPER_ADMIN) {
        throw new BadRequestException('Cannot modify SUPER_ADMIN permissions');
      }

      // Update admin permissions
      const updatedAdmin = await this.prisma.admin.update({
        where: { id: updatePermissionsDto.adminId },
        data: {
          permissions: updatePermissionsDto.permissions || (admin.permissions as string[]) || [],
        },
      });

      // Log activity
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
            permissions: Array.isArray(updatedAdmin.permissions) ? (updatedAdmin.permissions as string[]) : [],
            updatedAt: updatedAdmin.updatedAt,
          },
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update admin permissions');
    }
  }

  // =================================================================
  // ADMIN PROFILE MANAGEMENT
  // =================================================================

  async getAdminProfile(userId: string): Promise<AdminProfileResponseDto> {
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
        throw new NotFoundException('Admin profile not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get admin profile');
    }
  }

  async updateAdminProfile(userId: string, updateDto: UpdateAdminProfileDto): Promise<AdminProfileResponseDto> {
    try {
      const admin = await this.prisma.admin.findFirst({
        where: { userId },
        include: { user: true },
      });

      if (!admin) {
        throw new NotFoundException('Admin profile not found');
      }

      // Check if email is being changed and if it's already taken
      if (updateDto.email && updateDto.email !== admin.user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('Email is already in use');
        }
      }

      // Check if phone is being changed and if it's already taken
      if (updateDto.phone && updateDto.phone !== admin.user.phone) {
        const existingUser = await this.prisma.user.findUnique({
          where: { phone: updateDto.phone },
        });

        if (existingUser) {
          throw new BadRequestException('Phone number is already in use');
        }
      }

      // Update admin and user in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Update user data
        const userUpdateData: any = {};
        if (updateDto.email) userUpdateData.email = updateDto.email;
        if (updateDto.phone) userUpdateData.phone = updateDto.phone;

        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...userUpdateData,
              emailVerified: updateDto.email && updateDto.email !== admin.user.email ? false : admin.user.emailVerified,
              phoneVerified: updateDto.phone && updateDto.phone !== admin.user.phone ? false : admin.user.phoneVerified,
            },
          });
        }

        // Update admin data
        const adminUpdateData: any = {};
        if (updateDto.firstName) adminUpdateData.firstName = updateDto.firstName;
        if (updateDto.lastName) adminUpdateData.lastName = updateDto.lastName;
        if (updateDto.department) adminUpdateData.department = updateDto.department;
        if (updateDto.designation) adminUpdateData.designation = updateDto.designation;

        if (Object.keys(adminUpdateData).length > 0) {
          await prisma.admin.update({
            where: { id: admin.id },
            data: adminUpdateData,
          });
        }

        // Return updated admin with user data
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
          throw new BadRequestException('Failed to retrieve updated admin profile');
        }

        return updatedAdmin;
      });

      // Log the profile update
      await this.logActivity(userId, LogAction.UPDATE, LogLevel.INFO, 'Admin', admin.id, 'Admin profile updated');

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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update admin profile');
    }
  }

  async getAllAdmins(query: AdminListQueryDto): Promise<AdminListResponseDto> {
    try {
      const {
        search,
        department,
        role,
        status,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.AdminWhereInput = {
        user: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
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
        where.user = { ...where.user, role: role as any };
      }

      if (status) {
        where.user = { ...where.user, status: status as any };
      }

      // Build order by clause
      const orderBy: Prisma.AdminOrderByWithRelationInput = {};
      if (sortBy === 'firstName' || sortBy === 'lastName' || sortBy === 'department' || sortBy === 'designation') {
        orderBy[sortBy as keyof Prisma.AdminOrderByWithRelationInput] = sortOrder;
      } else {
        orderBy.user = { [sortBy as keyof Prisma.UserOrderByWithRelationInput]: sortOrder };
      }

      // Get admins and total count
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
        admins: admins.map(admin => ({
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
    } catch (error) {
      throw new BadRequestException('Failed to get admins list');
    }
  }

  async getAdminById(adminId: string): Promise<AdminProfileResponseDto> {
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
        throw new NotFoundException('Admin not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get admin details');
    }
  }

  async updateAdminStatus(adminId: string, statusDto: UpdateAdminStatusDto, currentUserId: string): Promise<{ message: string }> {
    try {
      // Check if current user is SUPER_ADMIN
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });

      if (currentUser?.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can update admin status');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
        include: { user: true },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      // Prevent updating SUPER_ADMIN status
      if (admin.user.role === UserRole.SUPER_ADMIN) {
        throw new BadRequestException('Cannot modify SUPER_ADMIN status');
      }

      await this.prisma.user.update({
        where: { id: admin.userId },
        data: { status: statusDto.status },
      });

      // Log the status update
      await this.logActivity(currentUserId, LogAction.UPDATE, LogLevel.INFO, 'Admin', adminId, `Admin status updated to ${statusDto.status}: ${admin.user.email}`);

      return { message: `Admin status updated to ${statusDto.status} successfully` };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update admin status');
    }
  }

  // =================================================================
  // JOB MANAGEMENT
  // =================================================================

  async getAllJobs(query: JobListQueryDto, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can access job management');
      }

      const {
        search,
        company,
        city,
        type,
        experience,
        status,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.JobWhereInput = {};

      // Add search filter
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { requirements: { contains: search, mode: 'insensitive' } },
          { responsibilities: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Add other filters
      if (company) where.companyId = company;
      if (city) where.cityId = city;
      if (type) where.jobType = type as any;
      if (experience) where.experienceLevel = experience as any;
      if (status) where.status = status as any;

      // Build order by clause
      const orderBy: Prisma.JobOrderByWithRelationInput = {};
      if (sortBy === 'title') {
        orderBy.title = sortOrder;
      } else if (sortBy === 'salaryMin') {
        orderBy.minSalary = sortOrder;
      } else if (sortBy === 'publishedAt') {
        orderBy.publishedAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get jobs with pagination
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
        jobs: jobs.map(job => this.mapJobToResponse(job)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to get jobs list');
    }
  }

  async createJob(createJobDto: CreateJobDto, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can create jobs');
      }

      // Generate unique slug
      const slug = createJobDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

      // Create job
      const job = await this.prisma.job.create({
        data: {
          title: createJobDto.title,
          slug,
          description: createJobDto.description,
          requirements: createJobDto.requirements,
          responsibilities: createJobDto.responsibilities,
          benefits: createJobDto.benefits,
          companyId: createJobDto.companyId,
          postedById: currentUser.id, // Admin who posted the job
          cityId: createJobDto.cityId,
          address: createJobDto.address,
          jobType: createJobDto.jobType as any,
          workMode: createJobDto.workMode as any,
          experienceLevel: createJobDto.experienceLevel as any,
          minExperience: createJobDto.minExperience,
          maxExperience: createJobDto.maxExperience,
          minSalary: createJobDto.minSalary,
          maxSalary: createJobDto.maxSalary,
          salaryNegotiable: createJobDto.salaryNegotiable || false,
          skillsRequired: createJobDto.skillsRequired || [],
          educationLevel: createJobDto.educationLevel as any,
          expiresAt: createJobDto.expiresAt ? new Date(createJobDto.expiresAt) : null,
          status: createJobDto.status as any || 'DRAFT',
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

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.CREATE,
        LogLevel.INFO,
        'Job',
        job.id,
        `Job created: ${job.title}`,
      );

      return {
        success: true,
        message: 'Job created successfully',
        data: this.mapJobToResponse(job),
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create job');
    }
  }

  async getJobById(jobId: string, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can access job details');
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
        throw new NotFoundException('Job not found');
      }

      return this.mapJobToResponse(job);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to get job details');
    }
  }

  async updateJob(jobId: string, updateJobDto: UpdateJobDto, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can update jobs');
      }

      // Check if job exists
      const existingJob = await this.prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!existingJob) {
        throw new NotFoundException('Job not found');
      }

      // Prepare update data
      const updateData: any = {};

      if (updateJobDto.title !== undefined) updateData.title = updateJobDto.title;
      if (updateJobDto.description !== undefined) updateData.description = updateJobDto.description;
      if (updateJobDto.requirements !== undefined) updateData.requirements = updateJobDto.requirements;
      if (updateJobDto.responsibilities !== undefined) updateData.responsibilities = updateJobDto.responsibilities;
      if (updateJobDto.benefits !== undefined) updateData.benefits = updateJobDto.benefits;
      if (updateJobDto.companyId !== undefined) updateData.companyId = updateJobDto.companyId;
      if (updateJobDto.cityId !== undefined) updateData.cityId = updateJobDto.cityId;
      if (updateJobDto.address !== undefined) updateData.address = updateJobDto.address;
      if (updateJobDto.jobType !== undefined) updateData.jobType = updateJobDto.jobType as any;
      if (updateJobDto.workMode !== undefined) updateData.workMode = updateJobDto.workMode as any;
      if (updateJobDto.experienceLevel !== undefined) updateData.experienceLevel = updateJobDto.experienceLevel as any;
      if (updateJobDto.minExperience !== undefined) updateData.minExperience = updateJobDto.minExperience;
      if (updateJobDto.maxExperience !== undefined) updateData.maxExperience = updateJobDto.maxExperience;
      if (updateJobDto.minSalary !== undefined) updateData.minSalary = updateJobDto.minSalary;
      if (updateJobDto.maxSalary !== undefined) updateData.maxSalary = updateJobDto.maxSalary;
      if (updateJobDto.salaryNegotiable !== undefined) updateData.salaryNegotiable = updateJobDto.salaryNegotiable;
      if (updateJobDto.skillsRequired !== undefined) updateData.skillsRequired = updateJobDto.skillsRequired;
      if (updateJobDto.educationLevel !== undefined) updateData.educationLevel = updateJobDto.educationLevel as any;
      if (updateJobDto.expiresAt !== undefined) {
        updateData.expiresAt = updateJobDto.expiresAt ? new Date(updateJobDto.expiresAt) : null;
      }
      if (updateJobDto.status !== undefined) updateData.status = updateJobDto.status as any;

      // Update the job
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

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Job',
        jobId,
        `Job updated: ${updatedJob.title}`,
      );

      return {
        success: true,
        message: 'Job updated successfully',
        data: this.mapJobToResponse(updatedJob),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update job');
    }
  }

  async deleteJob(jobId: string, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can delete jobs');
      }

      // Check if job exists
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Delete the job
      await this.prisma.job.delete({
        where: { id: jobId },
      });

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.DELETE,
        LogLevel.INFO,
        'Job',
        jobId,
        `Job deleted: ${job.title}`,
      );

      return {
        success: true,
        message: 'Job deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete job');
    }
  }

  async publishJob(jobId: string, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can publish jobs');
      }

      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, status: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      const updatedJob = await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Job',
        jobId,
        `Job published: ${job.title}`,
      );

      return {
        success: true,
        message: 'Job published successfully',
        data: { status: updatedJob.status, publishedAt: updatedJob.publishedAt },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to publish job');
    }
  }

  async closeJob(jobId: string, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can close jobs');
      }

      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, status: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      const updatedJob = await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'CLOSED',
        },
      });

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Job',
        jobId,
        `Job closed: ${job.title}`,
      );

      return {
        success: true,
        message: 'Job closed successfully',
        data: { status: updatedJob.status },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to close job');
    }
  }

  async archiveJob(jobId: string, currentUser: any) {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can archive jobs');
      }

      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, status: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      const updatedJob = await this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'ARCHIVED',
        },
      });

      // Log activity
      await this.logActivity(
        currentUser.id,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Job',
        jobId,
        `Job archived: ${job.title}`,
      );

      return {
        success: true,
        message: 'Job archived successfully',
        data: { status: updatedJob.status },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to archive job');
    }
  }

  async getJobApplications(jobId: string, query: any, currentUser: any): Promise<JobApplicationsResponseDto> {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can access job applications');
      }

      const { page = 1, limit = 20 } = query;
      const skip = (page - 1) * limit;

      // Check if job exists
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Get applications
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
        applications: applications.map(app => ({
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to get job applications');
    }
  }

  async getJobStats(jobId: string, currentUser: any): Promise<JobStatsResponseDto> {
    try {
      // Check if current user is ADMIN or SUPER_ADMIN
      if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role)) {
        throw new ForbiddenException('Only admins can access job statistics');
      }

      // Check if job exists
      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true },
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Get statistics
      const [
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs,
        totalApplications,
        totalViews,
        jobApplications,
        jobViews,
        recentApplications,
        recentViews,
      ] = await Promise.all([
        this.prisma.job.count(),
        this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.job.count({ where: { status: 'DRAFT' } }),
        this.prisma.job.count({ where: { status: 'CLOSED' } }),
        this.prisma.jobApplication.count(),
        this.prisma.job.aggregate({ _sum: { viewCount: true } }),
        this.prisma.jobApplication.count({ where: { jobId } }),
        this.prisma.job.findUnique({ where: { id: jobId }, select: { viewCount: true } }),
        this.prisma.jobApplication.count({
          where: {
            jobId,
            appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          },
        }),
        0, // No jobView table in schema
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to get job statistics');
    }
  }

  // =================================================================
  // HELPER METHODS
  // =================================================================

  private mapJobToResponse(job: any) {
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
      location: job.city ? {
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
      } : null,
    };
  }

  // =================================================================
  // APPLICATION MANAGEMENT
  // =================================================================

  async getAllApplications(query: ApplicationQueryDto, currentUser: any): Promise<ApplicationsListResponseDto> {
    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const whereClause: any = {};

      if (query.status) {
        whereClause.status = query.status;
      }

      if (query.jobTitle || query.companyName) {
        whereClause.job = {};
        if (query.jobTitle) {
          whereClause.job.title = { contains: query.jobTitle, mode: 'insensitive' };
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
            { firstName: { contains: query.candidateName, mode: 'insensitive' } },
            { lastName: { contains: query.candidateName, mode: 'insensitive' } },
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
        applications: applications.map(app => ({
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
            location: app.job.city ? {
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
            } : undefined,
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
            city: app.candidate.city ? {
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
            } : undefined,
          },
          resume: app.resume ? {
            id: app.resume.id,
            title: app.resume.title,
            fileName: app.resume.fileName,
            uploadedAt: app.resume.uploadedAt,
          } : undefined,
        })),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch applications');
    }
  }

  async getApplicationDetails(applicationId: string, currentUser: any): Promise<AdminApplicationResponseDto> {
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
        throw new NotFoundException('Application not found');
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
          location: application.job.city ? {
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
          } : undefined,
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
          city: application.candidate.city ? {
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
          } : undefined,
        },
        resume: application.resume ? {
          id: application.resume.id,
          title: application.resume.title,
          fileName: application.resume.fileName,
          uploadedAt: application.resume.uploadedAt,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch application details');
    }
  }

  async updateApplicationStatus(
    applicationId: string, 
    updateDto: UpdateApplicationStatusDto, 
    currentUser: any
  ): Promise<AdminApplicationResponseDto> {
    try {
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
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

      // Log the status update
      await this.logActivity(
        currentUser.id, 
        LogAction.UPDATE, 
        LogLevel.INFO, 
        'JobApplication', 
        applicationId, 
        `Application status updated to ${updateDto.status}`
      );

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
          location: updatedApplication.job.city ? {
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
          } : undefined,
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
          city: updatedApplication.candidate.city ? {
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
          } : undefined,
        },
        resume: updatedApplication.resume ? {
          id: updatedApplication.resume.id,
          title: updatedApplication.resume.title,
          fileName: updatedApplication.resume.fileName,
          uploadedAt: updatedApplication.resume.uploadedAt,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update application status');
    }
  }

  async addApplicationFeedback(
    applicationId: string, 
    feedbackDto: AddApplicationFeedbackDto, 
    currentUser: any
  ): Promise<AdminApplicationResponseDto> {
    try {
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
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

      // Log the feedback addition
      await this.logActivity(
        currentUser.id, 
        LogAction.UPDATE, 
        LogLevel.INFO, 
        'JobApplication', 
        applicationId, 
        'Feedback added to application'
      );

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
          location: updatedApplication.job.city ? {
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
          } : undefined,
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
          city: updatedApplication.candidate.city ? {
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
          } : undefined,
        },
        resume: updatedApplication.resume ? {
          id: updatedApplication.resume.id,
          title: updatedApplication.resume.title,
          fileName: updatedApplication.resume.fileName,
          uploadedAt: updatedApplication.resume.uploadedAt,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add feedback to application');
    }
  }

  async getApplicationStats(currentUser: any): Promise<ApplicationStatsResponseDto> {
    try {
      const [
        total,
        byStatus,
        byJobType,
        byExperienceLevel,
        recentApplications,
        averageResponseTime
      ] = await Promise.all([
        // Total applications
        this.prisma.jobApplication.count(),
        
        // Applications by status
        this.prisma.jobApplication.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        
        // Applications by job type
        this.prisma.jobApplication.groupBy({
          by: ['jobId'],
          _count: { jobId: true },
        }).then(async (result) => {
          const jobIds = result.map(r => r.jobId);
          const jobs = await this.prisma.job.findMany({
            where: { id: { in: jobIds } },
            select: { id: true, jobType: true },
          });
          
          const jobTypeMap = new Map(jobs.map(job => [job.id, job.jobType]));
          const byJobType: any = {
            FULL_TIME: 0,
            PART_TIME: 0,
            CONTRACT: 0,
            INTERNSHIP: 0,
            FREELANCE: 0,
          };
          
          result.forEach(r => {
            const jobType = jobTypeMap.get(r.jobId);
            if (jobType && byJobType.hasOwnProperty(jobType)) {
              byJobType[jobType] += r._count.jobId;
            }
          });
          
          return byJobType;
        }),
        
        // Applications by experience level
        this.prisma.jobApplication.groupBy({
          by: ['jobId'],
          _count: { jobId: true },
        }).then(async (result) => {
          const jobIds = result.map(r => r.jobId);
          const jobs = await this.prisma.job.findMany({
            where: { id: { in: jobIds } },
            select: { id: true, experienceLevel: true },
          });
          
          const experienceLevelMap = new Map(jobs.map(job => [job.id, job.experienceLevel]));
          const byExperienceLevel: any = {
            ENTRY_LEVEL: 0,
            MID_LEVEL: 0,
            SENIOR_LEVEL: 0,
            EXECUTIVE: 0,
          };
          
          result.forEach(r => {
            const experienceLevel = experienceLevelMap.get(r.jobId);
            if (experienceLevel && byExperienceLevel.hasOwnProperty(experienceLevel)) {
              byExperienceLevel[experienceLevel] += r._count.jobId;
            }
          });
          
          return byExperienceLevel;
        }),
        
        // Recent applications (last 7 days)
        this.prisma.jobApplication.count({
          where: {
            appliedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // Average response time
        this.prisma.jobApplication.findMany({
          where: {
            reviewedAt: { not: null },
          },
          select: {
            appliedAt: true,
            reviewedAt: true,
          },
        }).then((applications) => {
          if (applications.length === 0) return 0;
          
          const totalDays = applications.reduce((sum, app) => {
            const days = (app.reviewedAt!.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0);
          
          return totalDays / applications.length;
        }),
      ]);

      // Format status data
      const statusData: any = {
        APPLIED: 0,
        UNDER_REVIEW: 0,
        SHORTLISTED: 0,
        INTERVIEWED: 0,
        SELECTED: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      };
      
      byStatus.forEach(status => {
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch application statistics');
    }
  }

  // =================================================================
  // BULK OPERATIONS
  // =================================================================

  async bulkUpdateApplications(bulkUpdateDto: BulkUpdateApplicationsDto, currentUser: any): Promise<BulkUpdateResponseDto> {
    try {
      const { applicationIds, status, feedback } = bulkUpdateDto;
      const failedApplications: { applicationId: string; error: string }[] = [];
      let updatedCount = 0;

      // Process each application
      for (const applicationId of applicationIds) {
        try {
          // Check if application exists
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

          // Update application
          const updateData: any = {
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

          // Log the bulk update
          await this.logActivity(
            currentUser.id,
            LogAction.UPDATE,
            LogLevel.INFO,
            'JobApplication',
            applicationId,
            `Bulk update: Status changed to ${status}`
          );

          updatedCount++;
        } catch (error) {
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
    } catch (error) {
      throw new BadRequestException('Failed to perform bulk update');
    }
  }

  async bulkExportApplications(exportQuery: BulkExportQueryDto, currentUser: any): Promise<BulkExportResponseDto> {
    try {
      const format = exportQuery.format || 'csv';
      
      // Build where clause for filtering (same as getAllApplications)
      const whereClause: any = {};

      if (exportQuery.status) {
        whereClause.status = exportQuery.status;
      }

      if (exportQuery.jobTitle || exportQuery.companyName) {
        whereClause.job = {};
        if (exportQuery.jobTitle) {
          whereClause.job.title = { contains: exportQuery.jobTitle, mode: 'insensitive' };
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
            { firstName: { contains: exportQuery.candidateName, mode: 'insensitive' } },
            { lastName: { contains: exportQuery.candidateName, mode: 'insensitive' } },
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

      // Get all applications for export
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

      // Generate export data
      const exportData = applications.map(app => ({
        'Application ID': app.id,
        'Job Title': app.job.title,
        'Company': app.job.company.name,
        'Candidate Name': `${app.candidate.firstName} ${app.candidate.lastName}`,
        'Candidate Email': app.candidate.user.email,
        'Candidate Phone': app.candidate.user.phone || '',
        'Status': app.status,
        'Applied Date': app.appliedAt.toISOString().split('T')[0],
        'Reviewed Date': app.reviewedAt ? app.reviewedAt.toISOString().split('T')[0] : '',
        'Cover Letter': app.coverLetter || '',
        'Feedback': app.feedback || '',
        'Location': app.job.city ? `${app.job.city.name}, ${app.job.city.state.name}, ${app.job.city.state.country.name}` : '',
        'Job Type': app.job.jobType,
        'Experience Level': app.job.experienceLevel,
        'Work Mode': app.job.workMode,
      }));

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `applications_export_${timestamp}.${format}`;

      // For now, return a mock download URL
      // In a real implementation, you would generate the actual file and return a download URL
      const downloadUrl = `/api/admin/applications/download/${fileName}`;

      // Log the export activity
      await this.logActivity(
        currentUser.id,
        LogAction.VIEW,
        LogLevel.INFO,
        'JobApplication',
        'bulk-export',
        `Exported ${applications.length} applications in ${format.toUpperCase()} format`
      );

      return {
        success: true,
        downloadUrl,
        fileName,
        totalExported: applications.length,
        message: `Successfully exported ${applications.length} applications to ${format.toUpperCase()} format`,
      };
    } catch (error) {
      throw new BadRequestException('Failed to export applications');
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
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  // =================================================================
  // RESUME MANAGEMENT METHODS
  // =================================================================

  async getAllResumes(query: ResumeQueryDto, currentUser: any): Promise<ResumesListResponseDto> {
    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

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
          { candidate: { 
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } }
            ]
          } }
        ];
      }

      // Build order by
      const orderBy: any = {};
      if (query.sortBy) {
        orderBy[query.sortBy] = query.sortOrder || 'desc';
      } else {
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
        resumes: resumes.map(resume => ({
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch resumes');
    }
  }

  async getResumeById(resumeId: string, currentUser: any): Promise<AdminResumeResponseDto> {
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
        throw new NotFoundException('Resume not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch resume');
    }
  }

  async downloadResume(resumeId: string, currentUser: any) {
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
        throw new NotFoundException('Resume not found');
      }

      // Log the download activity
      await this.logActivity(
        currentUser.id,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        resumeId,
        `Resume downloaded: ${resume.fileName}`
      );

      // In a real implementation, you would:
      // 1. Check if the file exists on the filesystem
      // 2. Stream the file to the response
      // 3. Set appropriate headers for file download
      
      // For now, return the file path and metadata
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to download resume');
    }
  }

  async bulkDownloadResumes(bulkDownloadDto: BulkDownloadDto, currentUser: any): Promise<BulkDownloadResponseDto> {
    try {
      // Validate that all resume IDs exist
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
        throw new BadRequestException('One or more resume IDs not found');
      }

      // Calculate total size
      const totalSize = resumes.reduce((sum, resume) => sum + resume.fileSize, 0);

      // Log the bulk download activity
      await this.logActivity(
        currentUser.id,
        LogAction.VIEW,
        LogLevel.INFO,
        'Resume',
        bulkDownloadDto.resumeIds.join(','),
        `Bulk download initiated for ${resumes.length} resumes`
      );

      // In a real implementation, you would:
      // 1. Create a ZIP file containing all the resumes
      // 2. Upload it to a temporary storage location
      // 3. Generate a secure download URL with expiration
      
      // For now, return a mock response
      const downloadUrl = `https://temp-storage.example.com/bulk-downloads/${uuidv4()}.zip`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create bulk download package');
    }
  }

  async getResumeStats(currentUser: any): Promise<ResumeStatsResponseDto> {
    try {
      const [
        total,
        byMimeType,
        averageFileSize,
        recentUploads,
        defaultResumes,
      ] = await Promise.all([
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
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        this.prisma.resume.count({
          where: {
            isDefault: true,
          },
        }),
      ]);

      // Process mime type statistics
      const mimeTypeStats = {
        'application/pdf': 0,
        'application/msword': 0,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 0,
        'text/plain': 0,
        other: 0,
      };

      byMimeType.forEach((item) => {
        const mimeType = item.mimeType as keyof typeof mimeTypeStats;
        if (mimeTypeStats.hasOwnProperty(mimeType)) {
          mimeTypeStats[mimeType] = item._count;
        } else {
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch resume statistics');
    }
  }

  // =================================================================
  // NOTIFICATION MANAGEMENT
  // =================================================================

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
    currentUser: any,
  ): Promise<SendNotificationResponseDto> {
    try {
      const { userIds, type, title, message, data, expiresAt, sendEmail, sendPush, sendSms } = sendNotificationDto;

      // Verify admin permissions
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only admins can send notifications');
      }

      // Validate userIds exist
      const existingUsers = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      const validUserIds = existingUsers.map(user => user.id);
      const invalidUserIds = userIds.filter(id => !validUserIds.includes(id));

      if (validUserIds.length === 0) {
        throw new BadRequestException('No valid users found to send notifications to');
      }

      // Create notifications for valid users
      const notificationsData = validUserIds.map(userId => ({
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

      // Log the notification sending
      await this.logActivity(
        currentUser.id,
        LogAction.CREATE,
        LogLevel.INFO,
        'Notification',
        'bulk',
        `Sent ${type} notifications to ${validUserIds.length} users`,
        { userIds: validUserIds, type, title },
      );

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
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to send notifications');
    }
  }

  async broadcastNotification(
    broadcastNotificationDto: BroadcastNotificationDto,
    currentUser: any,
  ): Promise<BroadcastNotificationResponseDto> {
    try {
      const {
        userIds,
        roleFilters,
        excludeUserIds,
        type,
        title,
        message,
        data,
        expiresAt,
        sendEmail,
        sendPush,
        sendSms
      } = broadcastNotificationDto;

      // Verify admin permissions
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only admins can broadcast notifications');
      }

      // Build where clause for user filtering
      const whereClause: Prisma.UserWhereInput = {};

      if (userIds && userIds.length > 0) {
        whereClause.id = { in: userIds };
      }

      if (roleFilters && roleFilters.length > 0) {
        whereClause.role = { in: roleFilters as UserRole[] };
      }

      if (excludeUserIds && excludeUserIds.length > 0) {
        if (whereClause.id && typeof whereClause.id === 'object' && 'in' in whereClause.id) {
          whereClause.id = {
            in: (whereClause.id as { in: string[] }).in,
            notIn: excludeUserIds,
          };
        } else {
          whereClause.id = {
            notIn: excludeUserIds,
          };
        }
      }

      // Get total count of users to receive notification
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

      // Create notifications for all matching users
      // Note: In a real implementation, you might want to batch this for large user sets
      const users = await this.prisma.user.findMany({
        where: whereClause,
        select: { id: true },
      });

      const notificationsData = users.map(user => ({
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

      // Log the broadcast notification
      await this.logActivity(
        currentUser.id,
        LogAction.CREATE,
        LogLevel.INFO,
        'Notification',
        'broadcast',
        `Broadcasted ${type} notification to ${users.length} users`,
        { type, title, totalUsers: users.length, filters: { roleFilters, excludeUserIds } },
      );

      return {
        message: `Broadcast notification sent successfully to ${users.length} users`,
        notificationsSent: users.length,
        totalUsers: users.length,
        filters: {
          roleFilters: roleFilters || [],
          excludeUserIds: excludeUserIds || [],
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to broadcast notifications');
    }
  }

  async getNotificationTemplates(
    query: NotificationQueryDto,
    currentUser: any,
  ): Promise<NotificationTemplatesListResponseDto> {
    try {
      // Verify admin permissions
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only admins can view notification templates');
      }

      const {
        search,
        type,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: Prisma.NotificationTemplateWhereInput = {};

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

      // Get templates and total count
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
        templates: templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description ?? undefined,
          type: template.type,
          title: template.title,
          message: template.message,
          defaultData: template.defaultData as Record<string, any> | undefined,
          variables: template.variables as string[],
          isActive: template.isActive,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch notification templates');
    }
  }

  async createNotificationTemplate(
    createTemplateDto: CreateNotificationTemplateDto,
    currentUser: any,
  ): Promise<NotificationTemplateResponseDto> {
    try {
      const { name, description, type, title, message, defaultData, variables, isActive = true } = createTemplateDto;

      // Verify admin permissions
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only admins can create notification templates');
      }

      // Check if template name already exists
      const existingTemplate = await this.prisma.notificationTemplate.findUnique({
        where: { name },
      });

      if (existingTemplate) {
        throw new BadRequestException('A template with this name already exists');
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

      // Log the template creation
      await this.logActivity(
        currentUser.id,
        LogAction.CREATE,
        LogLevel.INFO,
        'NotificationTemplate',
        template.id,
        `Created notification template: ${name}`,
      );

      return {
        id: template.id,
        name: template.name,
        description: template.description ?? undefined,
        type: template.type,
        title: template.title,
        message: template.message,
        defaultData: template.defaultData as Record<string, any> | undefined,
        variables: template.variables as string[],
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to create notification template');
    }
  }

}
