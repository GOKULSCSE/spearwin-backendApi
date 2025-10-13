import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateAdminProfileDto, type AdminProfileResponseDto } from './dto/admin-profile.dto';
import { AdminListQueryDto, type AdminListResponseDto } from './dto/admin-list.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import { CreateJobDto, UpdateJobDto, JobListQueryDto, JobStatsResponseDto, JobApplicationsResponseDto } from './dto/admin-job.dto';
import { UpdateApplicationStatusDto, AddApplicationFeedbackDto, ApplicationQueryDto, AdminApplicationResponseDto, ApplicationsListResponseDto, ApplicationStatsResponseDto, BulkUpdateApplicationsDto, BulkUpdateResponseDto, BulkExportQueryDto, BulkExportResponseDto } from './dto/admin-application.dto';
import { ResumeQueryDto, AdminResumeResponseDto, ResumesListResponseDto, ResumeStatsResponseDto, BulkDownloadDto, BulkDownloadResponseDto } from './dto/admin-resume.dto';
import { SendNotificationDto, BroadcastNotificationDto, CreateNotificationTemplateDto, NotificationTemplateResponseDto, SendNotificationResponseDto, BroadcastNotificationResponseDto, NotificationTemplatesListResponseDto, NotificationQueryDto } from './dto/admin-notification.dto';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createAdmin(createAdminDto: CreateAdminDto, user: CurrentUser): Promise<import("./dto/admin-response.dto").CreateAdminResponseDto>;
    createCompany(createCompanyDto: CreateCompanyDto, user: CurrentUser): Promise<import("./dto/admin-response.dto").CreateCompanyResponseDto>;
    updatePermissions(updatePermissionsDto: UpdatePermissionsDto, user: CurrentUser): Promise<import("./dto/admin-response.dto").UpdatePermissionsResponseDto>;
    getAdminProfile(user: CurrentUser): Promise<AdminProfileResponseDto>;
    updateAdminProfile(user: CurrentUser, updateDto: UpdateAdminProfileDto): Promise<AdminProfileResponseDto>;
    getAllAdmins(query: AdminListQueryDto): Promise<AdminListResponseDto>;
    getAdminById(adminId: string): Promise<AdminProfileResponseDto>;
    updateAdminPermissions(adminId: string, user: CurrentUser, updateDto: UpdatePermissionsDto): Promise<import("./dto/admin-response.dto").UpdatePermissionsResponseDto>;
    updateAdminStatus(adminId: string, user: CurrentUser, statusDto: UpdateAdminStatusDto): Promise<{
        message: string;
    }>;
    getAllJobs(query: JobListQueryDto, user: CurrentUser): Promise<{
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
    createJob(createJobDto: CreateJobDto, user: CurrentUser): Promise<{
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
    getJobById(jobId: string, user: CurrentUser): Promise<{
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
    updateJob(jobId: string, updateJobDto: UpdateJobDto, user: CurrentUser): Promise<{
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
    deleteJob(jobId: string, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
    }>;
    publishJob(jobId: string, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
            publishedAt: Date | null;
        };
    }>;
    closeJob(jobId: string, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
        };
    }>;
    archiveJob(jobId: string, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
        data: {
            status: import("@prisma/client").$Enums.JobStatus;
        };
    }>;
    getJobApplications(jobId: string, query: any, user: CurrentUser): Promise<JobApplicationsResponseDto>;
    getJobStats(jobId: string, user: CurrentUser): Promise<JobStatsResponseDto>;
    getAllApplications(query: ApplicationQueryDto, user: CurrentUser): Promise<ApplicationsListResponseDto>;
    getApplicationDetails(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    updateApplicationStatus(applicationId: string, updateDto: UpdateApplicationStatusDto, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    addApplicationFeedback(applicationId: string, feedbackDto: AddApplicationFeedbackDto, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    getApplicationStats(user: CurrentUser): Promise<ApplicationStatsResponseDto>;
    markAsUnderReview(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    shortlistCandidate(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    scheduleInterview(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    selectCandidate(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    rejectApplication(applicationId: string, user: CurrentUser): Promise<AdminApplicationResponseDto>;
    bulkUpdateApplications(bulkUpdateDto: BulkUpdateApplicationsDto, user: CurrentUser): Promise<BulkUpdateResponseDto>;
    bulkExportApplications(exportQuery: BulkExportQueryDto, user: CurrentUser): Promise<BulkExportResponseDto>;
    getAllResumes(query: ResumeQueryDto, user: CurrentUser): Promise<ResumesListResponseDto>;
    getResumeById(resumeId: string, user: CurrentUser): Promise<AdminResumeResponseDto>;
    downloadResume(resumeId: string, user: CurrentUser): Promise<{
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
    bulkDownloadResumes(bulkDownloadDto: BulkDownloadDto, user: CurrentUser): Promise<BulkDownloadResponseDto>;
    getResumeStats(user: CurrentUser): Promise<ResumeStatsResponseDto>;
    sendNotification(sendNotificationDto: SendNotificationDto, user: CurrentUser): Promise<SendNotificationResponseDto>;
    broadcastNotification(broadcastNotificationDto: BroadcastNotificationDto, user: CurrentUser): Promise<BroadcastNotificationResponseDto>;
    getNotificationTemplates(query: NotificationQueryDto, user: CurrentUser): Promise<NotificationTemplatesListResponseDto>;
    createNotificationTemplate(createTemplateDto: CreateNotificationTemplateDto, user: CurrentUser): Promise<NotificationTemplateResponseDto>;
}
