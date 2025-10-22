import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AdminLoginDto } from '../auth/dto/admin-login.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import {
  UpdateAdminProfileDto,
  type AdminProfileResponseDto,
} from './dto/admin-profile.dto';
import {
  AdminListQueryDto,
  type AdminListResponseDto,
} from './dto/admin-list.dto';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto';
import {
  CreateJobDto,
  UpdateJobDto,
  JobListQueryDto,
  JobStatsResponseDto,
  JobApplicationsResponseDto,
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
  BulkExportResponseDto,
} from './dto/admin-application.dto';
import {
  ResumeQueryDto,
  AdminResumeResponseDto,
  ResumesListResponseDto,
  ResumeStatsResponseDto,
  BulkDownloadDto,
  BulkDownloadResponseDto,
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
  NotificationQueryDto,
} from './dto/admin-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // =================================================================
  // ADMIN AUTHENTICATION
  // =================================================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body(ValidationPipe) adminLoginDto: AdminLoginDto) {
    return this.adminService.adminLogin(adminLoginDto);
  }

  @Post('create-admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body(ValidationPipe) createAdminDto: CreateAdminDto,
  ) {
    return this.adminService.createAdmin(createAdminDto, null);
  }

  @Post('create-company')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.createCompany(createCompanyDto, user);
  }

  @Put('update-permissions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePermissions(
    @Body() updatePermissionsDto: UpdatePermissionsDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.updatePermissions(updatePermissionsDto, user);
  }

  // =================================================================
  // ADMIN PROFILE MANAGEMENT
  // =================================================================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getAdminProfile(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminProfileResponseDto> {
    return this.adminService.getAdminProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateAdminProfile(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateAdminProfileDto,
  ): Promise<AdminProfileResponseDto> {
    return this.adminService.updateAdminProfile(user.id, updateDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changeAdminPassword(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.adminService.changeAdminPassword(user.id, changePasswordDto);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard)
  async getAllAdmins(
    @Query(ValidationPipe) query: AdminListQueryDto,
  ): Promise<AdminListResponseDto> {
    return this.adminService.getAllAdmins(query);
  }

  @Get('admins/:id')
  @UseGuards(JwtAuthGuard)
  async getAdminById(
    @Param('id') adminId: string,
  ): Promise<AdminProfileResponseDto> {
    return this.adminService.getAdminById(adminId);
  }

  @Put('admins/:id/permissions')
  @UseGuards(JwtAuthGuard)
  async updateAdminPermissions(
    @Param('id') adminId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdatePermissionsDto,
  ) {
    return this.adminService.updatePermissions(updateDto, user);
  }

  @Put('admins/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateAdminStatus(
    @Param('id') adminId: string,
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) statusDto: UpdateAdminStatusDto,
  ): Promise<{ message: string }> {
    return this.adminService.updateAdminStatus(adminId, statusDto, user.id);
  }

  // =================================================================
  // JOB MANAGEMENT
  // =================================================================

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  async getAllJobs(
    @Query(ValidationPipe) query: JobListQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.getAllJobs(query, user);
  }

  @Post('jobs')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createJob(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.createJob(createJobDto, user);
  }

  @Get('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async getJobById(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.getJobById(jobId, user);
  }

  @Put('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async updateJob(
    @Param('id') jobId: string,
    @Body(ValidationPipe) updateJobDto: UpdateJobDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.updateJob(jobId, updateJobDto, user);
  }

  @Delete('jobs/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.deleteJob(jobId, user);
  }

  @Put('jobs/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishJob(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.publishJob(jobId, user);
  }

  @Put('jobs/:id/close')
  @UseGuards(JwtAuthGuard)
  async closeJob(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.closeJob(jobId, user);
  }

  @Put('jobs/:id/archive')
  @UseGuards(JwtAuthGuard)
  async archiveJob(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.archiveJob(jobId, user);
  }

  @Get('jobs/:id/applications')
  @UseGuards(JwtAuthGuard)
  async getJobApplications(
    @Param('id') jobId: string,
    @Query(ValidationPipe) query: any,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<JobApplicationsResponseDto> {
    return this.adminService.getJobApplications(jobId, query, user);
  }

  @Get('jobs/:id/stats')
  @UseGuards(JwtAuthGuard)
  async getJobStats(
    @Param('id') jobId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<JobStatsResponseDto> {
    return this.adminService.getJobStats(jobId, user);
  }

  // =================================================================
  // APPLICATION MANAGEMENT
  // =================================================================

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  async getAllApplications(
    @Query(ValidationPipe) query: ApplicationQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<ApplicationsListResponseDto> {
    return this.adminService.getAllApplications(query, user);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  async getApplicationDetails(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.getApplicationDetails(applicationId, user);
  }

  @Put('applications/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body(ValidationPipe) updateDto: UpdateApplicationStatusDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      updateDto,
      user,
    );
  }

  @Post('applications/:id/feedback')
  @UseGuards(JwtAuthGuard)
  async addApplicationFeedback(
    @Param('id') applicationId: string,
    @Body(ValidationPipe) feedbackDto: AddApplicationFeedbackDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.addApplicationFeedback(
      applicationId,
      feedbackDto,
      user,
    );
  }

  @Get('applications/stats')
  @UseGuards(JwtAuthGuard)
  async getApplicationStats(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<ApplicationStatsResponseDto> {
    return this.adminService.getApplicationStats(user);
  }

  // =================================================================
  // SPECIFIC APPLICATION STATUS UPDATES
  // =================================================================

  @Put('applications/:id/review')
  @UseGuards(JwtAuthGuard)
  async markAsUnderReview(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      { status: 'UNDER_REVIEW' },
      user,
    );
  }

  @Put('applications/:id/shortlist')
  @UseGuards(JwtAuthGuard)
  async shortlistCandidate(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      { status: 'SHORTLISTED' },
      user,
    );
  }

  @Put('applications/:id/interview')
  @UseGuards(JwtAuthGuard)
  async scheduleInterview(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      { status: 'INTERVIEWED' },
      user,
    );
  }

  @Put('applications/:id/select')
  @UseGuards(JwtAuthGuard)
  async selectCandidate(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      { status: 'SELECTED' },
      user,
    );
  }

  @Put('applications/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectApplication(
    @Param('id') applicationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminApplicationResponseDto> {
    return this.adminService.updateApplicationStatus(
      applicationId,
      { status: 'REJECTED' },
      user,
    );
  }

  // =================================================================
  // BULK OPERATIONS
  // =================================================================

  @Post('applications/bulk-update')
  @UseGuards(JwtAuthGuard)
  async bulkUpdateApplications(
    @Body(ValidationPipe) bulkUpdateDto: BulkUpdateApplicationsDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<BulkUpdateResponseDto> {
    return this.adminService.bulkUpdateApplications(bulkUpdateDto, user);
  }

  @Post('applications/bulk-export')
  @UseGuards(JwtAuthGuard)
  async bulkExportApplications(
    @Query(ValidationPipe) exportQuery: BulkExportQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<BulkExportResponseDto> {
    return this.adminService.bulkExportApplications(exportQuery, user);
  }

  // =================================================================
  // RESUME MANAGEMENT
  // =================================================================

  @Get('resumes')
  @UseGuards(JwtAuthGuard)
  async getAllResumes(
    @Query(ValidationPipe) query: ResumeQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<ResumesListResponseDto> {
    return this.adminService.getAllResumes(query, user);
  }

  @Get('resumes/:id')
  @UseGuards(JwtAuthGuard)
  async getResumeById(
    @Param('id') resumeId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<AdminResumeResponseDto> {
    return this.adminService.getResumeById(resumeId, user);
  }

  @Get('resumes/:id/download')
  @UseGuards(JwtAuthGuard)
  async downloadResume(
    @Param('id') resumeId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.adminService.downloadResume(resumeId, user);
  }

  @Post('resumes/bulk-download')
  @UseGuards(JwtAuthGuard)
  async bulkDownloadResumes(
    @Body(ValidationPipe) bulkDownloadDto: BulkDownloadDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<BulkDownloadResponseDto> {
    return this.adminService.bulkDownloadResumes(bulkDownloadDto, user);
  }

  @Get('resumes/stats')
  @UseGuards(JwtAuthGuard)
  async getResumeStats(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<ResumeStatsResponseDto> {
    return this.adminService.getResumeStats(user);
  }

  // =================================================================
  // NOTIFICATION MANAGEMENT
  // =================================================================

  @Post('notifications/send')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Body(ValidationPipe) sendNotificationDto: SendNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<SendNotificationResponseDto> {
    return this.adminService.sendNotification(sendNotificationDto, user);
  }

  @Post('notifications/broadcast')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async broadcastNotification(
    @Body(ValidationPipe) broadcastNotificationDto: BroadcastNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<BroadcastNotificationResponseDto> {
    return this.adminService.broadcastNotification(
      broadcastNotificationDto,
      user,
    );
  }

  @Get('notifications/templates')
  @UseGuards(JwtAuthGuard)
  async getNotificationTemplates(
    @Query(ValidationPipe) query: NotificationQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationTemplatesListResponseDto> {
    return this.adminService.getNotificationTemplates(query, user);
  }

  @Post('notifications/templates')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createNotificationTemplate(
    @Body(ValidationPipe) createTemplateDto: CreateNotificationTemplateDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationTemplateResponseDto> {
    return this.adminService.createNotificationTemplate(
      createTemplateDto,
      user,
    );
  }
}
