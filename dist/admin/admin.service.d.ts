import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminLoginDto } from '../auth/dto/admin-login.dto';
import { AdminLoginResponseDto } from './dto/admin-auth-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateAdminProfileDto, AdminProfileResponseDto } from './dto/admin-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AdminListQueryDto, AdminListResponseDto } from './dto/admin-list.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { CreateJobDto, UpdateJobDto, JobListQueryDto, JobStatsResponseDto, JobApplicationsResponseDto } from './dto/admin-job.dto';
import { UpdateApplicationStatusDto, AddApplicationFeedbackDto, ApplicationQueryDto, AdminApplicationResponseDto, ApplicationsListResponseDto, ApplicationStatsResponseDto, BulkUpdateApplicationsDto, BulkUpdateResponseDto, BulkExportQueryDto, BulkExportResponseDto } from './dto/admin-application.dto';
import { ResumeQueryDto, AdminResumeResponseDto, ResumesListResponseDto, ResumeStatsResponseDto, BulkDownloadDto, BulkDownloadResponseDto } from './dto/admin-resume.dto';
import { AdvancedCVSearchQueryDto, AdvancedCVSearchResponseDto } from './dto/advanced-cv-search.dto';
import { SendNotificationDto, BroadcastNotificationDto, CreateNotificationTemplateDto, NotificationTemplateResponseDto, SendNotificationResponseDto, BroadcastNotificationResponseDto, NotificationTemplatesListResponseDto, NotificationQueryDto } from './dto/admin-notification.dto';
import { CreateAdminResponseDto, CreateCompanyResponseDto, UpdatePermissionsResponseDto } from './dto/admin-response.dto';
import { Prisma } from '@prisma/client';
export declare class AdminService {
    private prisma;
    private readonly jwtService;
    private readonly pdfExtractor;
    private readonly logger;
    constructor(prisma: DatabaseService, jwtService: JwtService, pdfExtractor: PdfExtractorService);
    adminLogin(adminLoginDto: AdminLoginDto): Promise<AdminLoginResponseDto>;
    createAdmin(createAdminDto: CreateAdminDto, currentUser: any): Promise<CreateAdminResponseDto>;
    createCompany(createCompanyDto: CreateCompanyDto, currentUser: any): Promise<CreateCompanyResponseDto>;
    updatePermissions(updatePermissionsDto: UpdatePermissionsDto, currentUser: any): Promise<UpdatePermissionsResponseDto>;
    getAdminProfile(userId: string): Promise<AdminProfileResponseDto>;
    updateAdminProfile(userId: string, updateDto: UpdateAdminProfileDto): Promise<AdminProfileResponseDto>;
    updateAdminProfileById(adminId: string, updateDto: UpdateAdminProfileDto): Promise<AdminProfileResponseDto>;
    changeAdminPassword(adminId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getAllAdmins(query: AdminListQueryDto): Promise<AdminListResponseDto>;
    getAdminById(adminId: string): Promise<AdminProfileResponseDto>;
    updateAdminStatus(adminId: string, statusDto: UpdateAdminStatusDto, currentUserId: string): Promise<{
        message: string;
    }>;
    updateUserProfile(userId: string, updateDto: UpdateUserProfileDto, currentUserId: string): Promise<{
        message: string;
        user: any;
    }>;
    getAllJobs(query: JobListQueryDto, currentUser: any): Promise<{
        jobs: {
            id: any;
            title: any;
            slug: any;
            description: any;
            requirements: any;
            responsibilities: any;
            benefits: any;
            companyId: any;
            postedById: any;
            cityId: any;
            address: any;
            jobType: any;
            workMode: any;
            experienceLevel: any;
            minExperience: any;
            maxExperience: any;
            minSalary: any;
            maxSalary: any;
            salaryNegotiable: any;
            skillsRequired: any;
            educationLevel: any;
            applicationCount: any;
            viewCount: any;
            status: any;
            expiresAt: any;
            publishedAt: any;
            closedAt: any;
            createdAt: any;
            updatedAt: any;
            company: any;
            postedBy: any;
            location: {
                city: {
                    id: any;
                    name: any;
                    state: {
                        id: any;
                        name: any;
                        code: any;
                        country: {
                            id: any;
                            name: any;
                            code: any;
                        };
                    };
                };
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    createJob(createJobDto: CreateJobDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            title: any;
            slug: any;
            description: any;
            requirements: any;
            responsibilities: any;
            benefits: any;
            companyId: any;
            postedById: any;
            cityId: any;
            address: any;
            jobType: any;
            workMode: any;
            experienceLevel: any;
            minExperience: any;
            maxExperience: any;
            minSalary: any;
            maxSalary: any;
            salaryNegotiable: any;
            skillsRequired: any;
            educationLevel: any;
            applicationCount: any;
            viewCount: any;
            status: any;
            expiresAt: any;
            publishedAt: any;
            closedAt: any;
            createdAt: any;
            updatedAt: any;
            company: any;
            postedBy: any;
            location: {
                city: {
                    id: any;
                    name: any;
                    state: {
                        id: any;
                        name: any;
                        code: any;
                        country: {
                            id: any;
                            name: any;
                            code: any;
                        };
                    };
                };
            } | null;
        };
    }>;
    getJobById(jobId: string, currentUser: any): Promise<{
        id: any;
        title: any;
        slug: any;
        description: any;
        requirements: any;
        responsibilities: any;
        benefits: any;
        companyId: any;
        postedById: any;
        cityId: any;
        address: any;
        jobType: any;
        workMode: any;
        experienceLevel: any;
        minExperience: any;
        maxExperience: any;
        minSalary: any;
        maxSalary: any;
        salaryNegotiable: any;
        skillsRequired: any;
        educationLevel: any;
        applicationCount: any;
        viewCount: any;
        status: any;
        expiresAt: any;
        publishedAt: any;
        closedAt: any;
        createdAt: any;
        updatedAt: any;
        company: any;
        postedBy: any;
        location: {
            city: {
                id: any;
                name: any;
                state: {
                    id: any;
                    name: any;
                    code: any;
                    country: {
                        id: any;
                        name: any;
                        code: any;
                    };
                };
            };
        } | null;
    }>;
    updateJob(jobId: string, updateJobDto: UpdateJobDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            title: any;
            slug: any;
            description: any;
            requirements: any;
            responsibilities: any;
            benefits: any;
            companyId: any;
            postedById: any;
            cityId: any;
            address: any;
            jobType: any;
            workMode: any;
            experienceLevel: any;
            minExperience: any;
            maxExperience: any;
            minSalary: any;
            maxSalary: any;
            salaryNegotiable: any;
            skillsRequired: any;
            educationLevel: any;
            applicationCount: any;
            viewCount: any;
            status: any;
            expiresAt: any;
            publishedAt: any;
            closedAt: any;
            createdAt: any;
            updatedAt: any;
            company: any;
            postedBy: any;
            location: {
                city: {
                    id: any;
                    name: any;
                    state: {
                        id: any;
                        name: any;
                        code: any;
                        country: {
                            id: any;
                            name: any;
                            code: any;
                        };
                    };
                };
            } | null;
        };
    }>;
    deleteJob(jobId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    publishJob(jobId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
            publishedAt: Date | null;
        };
    }>;
    closeJob(jobId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
        };
    }>;
    archiveJob(jobId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
        };
    }>;
    updateJobStatus(jobId: string, status: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            company: {
                name: string;
                id: string;
                logo: string | null;
            };
        } & {
            status: import("@prisma/client").$Enums.JobStatus;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            address: string | null;
            cityId: number | null;
            description: string;
            title: string;
            expiresAt: Date | null;
            slug: string;
            companyId: string;
            requirements: string | null;
            responsibilities: string | null;
            benefits: string | null;
            jobType: import("@prisma/client").$Enums.JobType;
            workMode: import("@prisma/client").$Enums.WorkMode;
            experienceLevel: import("@prisma/client").$Enums.ExperienceLevel;
            minExperience: number | null;
            maxExperience: number | null;
            minSalary: Prisma.Decimal | null;
            maxSalary: Prisma.Decimal | null;
            salaryNegotiable: boolean;
            skillsRequired: string[];
            educationLevel: import("@prisma/client").$Enums.EducationLevel | null;
            publishedAt: Date | null;
            postedById: string | null;
            applicationCount: number;
            viewCount: number;
            closedAt: Date | null;
        };
    }>;
    getJobApplications(jobId: string, query: any, currentUser: any): Promise<JobApplicationsResponseDto>;
    getJobStats(jobId: string, currentUser: any): Promise<JobStatsResponseDto>;
    private mapJobToResponse;
    getAllApplications(query: ApplicationQueryDto, currentUser: any): Promise<ApplicationsListResponseDto>;
    getApplicationDetails(applicationId: string, currentUser: any): Promise<AdminApplicationResponseDto>;
    updateApplicationStatus(applicationId: string, updateDto: UpdateApplicationStatusDto, currentUser: any): Promise<AdminApplicationResponseDto>;
    addApplicationFeedback(applicationId: string, feedbackDto: AddApplicationFeedbackDto, currentUser: any): Promise<AdminApplicationResponseDto>;
    getApplicationStats(currentUser: any): Promise<ApplicationStatsResponseDto>;
    bulkUpdateApplications(bulkUpdateDto: BulkUpdateApplicationsDto, currentUser: any): Promise<BulkUpdateResponseDto>;
    bulkExportApplications(exportQuery: BulkExportQueryDto, currentUser: any): Promise<BulkExportResponseDto>;
    private logActivity;
    getAllResumes(query: ResumeQueryDto, currentUser: any): Promise<ResumesListResponseDto>;
    getResumeById(resumeId: string, currentUser: any): Promise<AdminResumeResponseDto>;
    downloadResume(resumeId: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            resumeId: string;
            fileName: string;
            filePath: string;
            fileSize: number;
            mimeType: string;
            candidateName: string;
            candidateEmail: string;
        };
    }>;
    bulkDownloadResumes(bulkDownloadDto: BulkDownloadDto, currentUser: any): Promise<BulkDownloadResponseDto>;
    getResumeStats(currentUser: any): Promise<ResumeStatsResponseDto>;
    sendNotification(sendNotificationDto: SendNotificationDto, currentUser: any): Promise<SendNotificationResponseDto>;
    broadcastNotification(broadcastNotificationDto: BroadcastNotificationDto, currentUser: any): Promise<BroadcastNotificationResponseDto>;
    getNotificationTemplates(query: NotificationQueryDto, currentUser: any): Promise<NotificationTemplatesListResponseDto>;
    createNotificationTemplate(createTemplateDto: CreateNotificationTemplateDto, currentUser: any): Promise<NotificationTemplateResponseDto>;
    advancedCVSearch(query: AdvancedCVSearchQueryDto, currentUser: any): Promise<AdvancedCVSearchResponseDto>;
    extractTextFromAllResumes(currentUser: any): Promise<{
        message: string;
        total: number;
        processed: number;
        successful: number;
        failed: number;
    }>;
}
