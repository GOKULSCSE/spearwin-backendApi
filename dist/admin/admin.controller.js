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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const admin_login_dto_1 = require("../auth/dto/admin-login.dto");
const create_company_dto_1 = require("./dto/create-company.dto");
const update_permissions_dto_1 = require("./dto/update-permissions.dto");
const admin_profile_dto_1 = require("./dto/admin-profile.dto");
const admin_list_dto_1 = require("./dto/admin-list.dto");
const update_admin_status_dto_1 = require("./dto/update-admin-status.dto");
const admin_job_dto_1 = require("./dto/admin-job.dto");
const admin_application_dto_1 = require("./dto/admin-application.dto");
const admin_resume_dto_1 = require("./dto/admin-resume.dto");
const admin_notification_dto_1 = require("./dto/admin-notification.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const change_password_dto_1 = require("../user/dto/change-password.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async adminLogin(adminLoginDto) {
        return this.adminService.adminLogin(adminLoginDto);
    }
    async createAdmin(createAdminDto) {
        return this.adminService.createAdmin(createAdminDto, null);
    }
    async createCompany(createCompanyDto, user) {
        return this.adminService.createCompany(createCompanyDto, user);
    }
    async updatePermissions(updatePermissionsDto, user) {
        return this.adminService.updatePermissions(updatePermissionsDto, user);
    }
    async getAdminProfile(user) {
        return this.adminService.getAdminProfile(user.id);
    }
    async updateAdminProfile(user, updateDto) {
        return this.adminService.updateAdminProfile(user.id, updateDto);
    }
    async changeAdminPassword(user, changePasswordDto) {
        return this.adminService.changeAdminPassword(user.id, changePasswordDto);
    }
    async getAllAdmins(query) {
        return this.adminService.getAllAdmins(query);
    }
    async getAdminById(adminId) {
        return this.adminService.getAdminById(adminId);
    }
    async updateAdminPermissions(adminId, user, updateDto) {
        return this.adminService.updatePermissions(updateDto, user);
    }
    async updateAdminStatus(adminId, user, statusDto) {
        return this.adminService.updateAdminStatus(adminId, statusDto, user.id);
    }
    async getAllJobs(query, user) {
        return this.adminService.getAllJobs(query, user);
    }
    async createJob(createJobDto, user) {
        return this.adminService.createJob(createJobDto, user);
    }
    async getJobById(jobId, user) {
        return this.adminService.getJobById(jobId, user);
    }
    async updateJob(jobId, updateJobDto, user) {
        return this.adminService.updateJob(jobId, updateJobDto, user);
    }
    async deleteJob(jobId, user) {
        return this.adminService.deleteJob(jobId, user);
    }
    async publishJob(jobId, user) {
        return this.adminService.publishJob(jobId, user);
    }
    async closeJob(jobId, user) {
        return this.adminService.closeJob(jobId, user);
    }
    async archiveJob(jobId, user) {
        return this.adminService.archiveJob(jobId, user);
    }
    async getJobApplications(jobId, query, user) {
        return this.adminService.getJobApplications(jobId, query, user);
    }
    async getJobStats(jobId, user) {
        return this.adminService.getJobStats(jobId, user);
    }
    async getAllApplications(query, user) {
        return this.adminService.getAllApplications(query, user);
    }
    async getApplicationDetails(applicationId, user) {
        return this.adminService.getApplicationDetails(applicationId, user);
    }
    async updateApplicationStatus(applicationId, updateDto, user) {
        return this.adminService.updateApplicationStatus(applicationId, updateDto, user);
    }
    async addApplicationFeedback(applicationId, feedbackDto, user) {
        return this.adminService.addApplicationFeedback(applicationId, feedbackDto, user);
    }
    async getApplicationStats(user) {
        return this.adminService.getApplicationStats(user);
    }
    async markAsUnderReview(applicationId, user) {
        return this.adminService.updateApplicationStatus(applicationId, { status: 'UNDER_REVIEW' }, user);
    }
    async shortlistCandidate(applicationId, user) {
        return this.adminService.updateApplicationStatus(applicationId, { status: 'SHORTLISTED' }, user);
    }
    async scheduleInterview(applicationId, user) {
        return this.adminService.updateApplicationStatus(applicationId, { status: 'INTERVIEWED' }, user);
    }
    async selectCandidate(applicationId, user) {
        return this.adminService.updateApplicationStatus(applicationId, { status: 'SELECTED' }, user);
    }
    async rejectApplication(applicationId, user) {
        return this.adminService.updateApplicationStatus(applicationId, { status: 'REJECTED' }, user);
    }
    async bulkUpdateApplications(bulkUpdateDto, user) {
        return this.adminService.bulkUpdateApplications(bulkUpdateDto, user);
    }
    async bulkExportApplications(exportQuery, user) {
        return this.adminService.bulkExportApplications(exportQuery, user);
    }
    async getAllResumes(query, user) {
        return this.adminService.getAllResumes(query, user);
    }
    async getResumeById(resumeId, user) {
        return this.adminService.getResumeById(resumeId, user);
    }
    async downloadResume(resumeId, user) {
        return this.adminService.downloadResume(resumeId, user);
    }
    async bulkDownloadResumes(bulkDownloadDto, user) {
        return this.adminService.bulkDownloadResumes(bulkDownloadDto, user);
    }
    async getResumeStats(user) {
        return this.adminService.getResumeStats(user);
    }
    async sendNotification(sendNotificationDto, user) {
        return this.adminService.sendNotification(sendNotificationDto, user);
    }
    async broadcastNotification(broadcastNotificationDto, user) {
        return this.adminService.broadcastNotification(broadcastNotificationDto, user);
    }
    async getNotificationTemplates(query, user) {
        return this.adminService.getNotificationTemplates(query, user);
    }
    async createNotificationTemplate(createTemplateDto, user) {
        return this.adminService.createNotificationTemplate(createTemplateDto, user);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('create-admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('create-company'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Put)('update-permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_permissions_dto_1.UpdatePermissionsDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_profile_dto_1.UpdateAdminProfileDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdminProfile", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeAdminPassword", null);
__decorate([
    (0, common_1.Get)('admins'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_list_dto_1.AdminListQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Get)('admins/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminById", null);
__decorate([
    (0, common_1.Put)('admins/:id/permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_permissions_dto_1.UpdatePermissionsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdminPermissions", null);
__decorate([
    (0, common_1.Put)('admins/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_admin_status_dto_1.UpdateAdminStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdminStatus", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_job_dto_1.JobListQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllJobs", null);
__decorate([
    (0, common_1.Post)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_job_dto_1.CreateJobDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createJob", null);
__decorate([
    (0, common_1.Get)('jobs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getJobById", null);
__decorate([
    (0, common_1.Put)('jobs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_job_dto_1.UpdateJobDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Delete)('jobs/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteJob", null);
__decorate([
    (0, common_1.Put)('jobs/:id/publish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "publishJob", null);
__decorate([
    (0, common_1.Put)('jobs/:id/close'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "closeJob", null);
__decorate([
    (0, common_1.Put)('jobs/:id/archive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "archiveJob", null);
__decorate([
    (0, common_1.Get)('jobs/:id/applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getJobApplications", null);
__decorate([
    (0, common_1.Get)('jobs/:id/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getJobStats", null);
__decorate([
    (0, common_1.Get)('applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_application_dto_1.ApplicationQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllApplications", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApplicationDetails", null);
__decorate([
    (0, common_1.Put)('applications/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_application_dto_1.UpdateApplicationStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Post)('applications/:id/feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_application_dto_1.AddApplicationFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addApplicationFeedback", null);
__decorate([
    (0, common_1.Get)('applications/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApplicationStats", null);
__decorate([
    (0, common_1.Put)('applications/:id/review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "markAsUnderReview", null);
__decorate([
    (0, common_1.Put)('applications/:id/shortlist'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "shortlistCandidate", null);
__decorate([
    (0, common_1.Put)('applications/:id/interview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "scheduleInterview", null);
__decorate([
    (0, common_1.Put)('applications/:id/select'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "selectCandidate", null);
__decorate([
    (0, common_1.Put)('applications/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Post)('applications/bulk-update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_application_dto_1.BulkUpdateApplicationsDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkUpdateApplications", null);
__decorate([
    (0, common_1.Post)('applications/bulk-export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_application_dto_1.BulkExportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkExportApplications", null);
__decorate([
    (0, common_1.Get)('resumes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_resume_dto_1.ResumeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllResumes", null);
__decorate([
    (0, common_1.Get)('resumes/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getResumeById", null);
__decorate([
    (0, common_1.Get)('resumes/:id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "downloadResume", null);
__decorate([
    (0, common_1.Post)('resumes/bulk-download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_resume_dto_1.BulkDownloadDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkDownloadResumes", null);
__decorate([
    (0, common_1.Get)('resumes/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getResumeStats", null);
__decorate([
    (0, common_1.Post)('notifications/send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_notification_dto_1.SendNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('notifications/broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_notification_dto_1.BroadcastNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "broadcastNotification", null);
__decorate([
    (0, common_1.Get)('notifications/templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_notification_dto_1.NotificationQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getNotificationTemplates", null);
__decorate([
    (0, common_1.Post)('notifications/templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_notification_dto_1.CreateNotificationTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createNotificationTemplate", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map