import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards, 
  ValidationPipe, 
  UploadedFile, 
  UseInterceptors 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { CandidateService } from './candidate.service';
import { UpdateCandidateProfileDto, UpdateAvailabilityDto, type CandidateProfileResponseDto } from './dto/candidate-profile.dto';
import { CreateCandidateSkillDto, UpdateCandidateSkillDto, type CandidateSkillResponseDto } from './dto/candidate-skill.dto';
import { CreateCandidateEducationDto, UpdateCandidateEducationDto, type CandidateEducationResponseDto } from './dto/candidate-education.dto';
import { CreateCandidateExperienceDto, UpdateCandidateExperienceDto, type CandidateExperienceResponseDto } from './dto/candidate-experience.dto';
import { 
  CreateJobAlertDto, 
  UpdateJobAlertDto, 
  JobAlertResponseDto, 
  RecommendedJobsResponseDto, 
  JobAlertsResponseDto 
} from './dto/job-alert.dto';
import { 
  ApplyForJobDto, 
  UpdateApplicationDto, 
  ApplicationResponseDto, 
  ApplicationsResponseDto, 
  ApplicationHistoryQueryDto 
} from './dto/job-application.dto';
import { 
  ResumeParseRequestDto, 
  ResumeParseResponseDto, 
  ResumeAnalysisResponseDto, 
  ResumeOptimizationResponseDto 
} from './dto/resume-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('candidate')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  // =================================================================
  // CANDIDATE PROFILE MANAGEMENT
  // =================================================================

  @Get('profile')
  async getCandidateProfile(@GetCurrentUser() user: CurrentUser): Promise<CandidateProfileResponseDto> {
    return this.candidateService.getCandidateProfile(user.id);
  }

  @Put('profile')
  async updateCandidateProfile(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateService.updateCandidateProfile(user.id, updateDto);
  }

  @Post('profile/picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @GetCurrentUser() user: CurrentUser,
    @UploadedFile() file: Multer.File,
  ): Promise<{ message: string; profilePicture: string }> {
    return this.candidateService.uploadProfilePicture(user.id, file);
  }

  @Delete('profile/picture')
  async deleteProfilePicture(@GetCurrentUser() user: CurrentUser): Promise<{ message: string }> {
    return this.candidateService.deleteProfilePicture(user.id);
  }

  @Put('availability')
  async updateAvailability(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateDto: UpdateAvailabilityDto,
  ): Promise<{ message: string }> {
    return this.candidateService.updateAvailability(user.id, updateDto);
  }

  // =================================================================
  // CANDIDATE SKILLS MANAGEMENT
  // =================================================================

  @Get('skills')
  async getCandidateSkills(@GetCurrentUser() user: CurrentUser): Promise<CandidateSkillResponseDto[]> {
    return this.candidateService.getCandidateSkills(user.id);
  }

  @Post('skills')
  async addCandidateSkill(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCandidateSkillDto,
  ): Promise<CandidateSkillResponseDto> {
    return this.candidateService.addCandidateSkill(user.id, createDto);
  }

  @Put('skills/:id')
  async updateCandidateSkill(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') skillId: string,
    @Body(ValidationPipe) updateDto: UpdateCandidateSkillDto,
  ): Promise<CandidateSkillResponseDto> {
    return this.candidateService.updateCandidateSkill(user.id, skillId, updateDto);
  }

  @Delete('skills/:id')
  async deleteCandidateSkill(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') skillId: string,
  ): Promise<{ message: string }> {
    return this.candidateService.deleteCandidateSkill(user.id, skillId);
  }

  // =================================================================
  // CANDIDATE EDUCATION MANAGEMENT
  // =================================================================

  @Get('education')
  async getCandidateEducation(@GetCurrentUser() user: CurrentUser): Promise<CandidateEducationResponseDto[]> {
    return this.candidateService.getCandidateEducation(user.id);
  }

  @Post('education')
  async addCandidateEducation(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCandidateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    return this.candidateService.addCandidateEducation(user.id, createDto);
  }

  @Put('education/:id')
  async updateCandidateEducation(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') educationId: string,
    @Body(ValidationPipe) updateDto: UpdateCandidateEducationDto,
  ): Promise<CandidateEducationResponseDto> {
    return this.candidateService.updateCandidateEducation(user.id, educationId, updateDto);
  }

  @Delete('education/:id')
  async deleteCandidateEducation(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') educationId: string,
  ): Promise<{ message: string }> {
    return this.candidateService.deleteCandidateEducation(user.id, educationId);
  }

  // =================================================================
  // CANDIDATE EXPERIENCE MANAGEMENT
  // =================================================================

  @Get('experience')
  async getCandidateExperience(@GetCurrentUser() user: CurrentUser): Promise<CandidateExperienceResponseDto[]> {
    return this.candidateService.getCandidateExperience(user.id);
  }

  @Post('experience')
  async addCandidateExperience(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateCandidateExperienceDto,
  ): Promise<CandidateExperienceResponseDto> {
    return this.candidateService.addCandidateExperience(user.id, createDto);
  }

  @Put('experience/:id')
  async updateCandidateExperience(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') experienceId: string,
    @Body(ValidationPipe) updateDto: UpdateCandidateExperienceDto,
  ): Promise<CandidateExperienceResponseDto> {
    return this.candidateService.updateCandidateExperience(user.id, experienceId, updateDto);
  }

  @Delete('experience/:id')
  async deleteCandidateExperience(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') experienceId: string,
  ): Promise<{ message: string }> {
    return this.candidateService.deleteCandidateExperience(user.id, experienceId);
  }

  // =================================================================
  // JOB RECOMMENDATIONS & ALERTS
  // =================================================================

  @Get('recommended-jobs')
  async getRecommendedJobs(
    @GetCurrentUser() user: CurrentUser,
    @Query() query: any,
  ): Promise<RecommendedJobsResponseDto> {
    return this.candidateService.getRecommendedJobs(user.id, query);
  }

  @Get('job-alerts')
  async getJobAlerts(
    @GetCurrentUser() user: CurrentUser,
    @Query() query: any,
  ): Promise<JobAlertsResponseDto> {
    return this.candidateService.getJobAlerts(user.id, query);
  }

  @Post('job-alerts')
  async createJobAlert(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) createDto: CreateJobAlertDto,
  ): Promise<JobAlertResponseDto> {
    return this.candidateService.createJobAlert(user.id, createDto);
  }

  @Put('job-alerts/:id')
  async updateJobAlert(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') alertId: string,
    @Body(ValidationPipe) updateDto: UpdateJobAlertDto,
  ): Promise<JobAlertResponseDto> {
    return this.candidateService.updateJobAlert(user.id, alertId, updateDto);
  }

  // =================================================================
  // JOB APPLICATIONS MANAGEMENT
  // =================================================================

  @Get('applications')
  async getCandidateApplications(
    @GetCurrentUser() user: CurrentUser,
    @Query() query: any,
  ): Promise<ApplicationsResponseDto> {
    return this.candidateService.getCandidateApplications(user.id, query);
  }

  @Get('application-history')
  async getApplicationHistory(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: ApplicationHistoryQueryDto,
  ): Promise<ApplicationsResponseDto> {
    return this.candidateService.getApplicationHistory(user.id, query);
  }

  @Get('applications/:id')
  async getApplicationDetails(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') applicationId: string,
  ): Promise<ApplicationResponseDto> {
    return this.candidateService.getApplicationDetails(user.id, applicationId);
  }

  @Put('applications/:id')
  async updateApplication(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') applicationId: string,
    @Body(ValidationPipe) updateDto: UpdateApplicationDto,
  ): Promise<ApplicationResponseDto> {
    return this.candidateService.updateApplication(user.id, applicationId, updateDto);
  }

  // =================================================================
  // RESUME PARSING & ANALYSIS
  // =================================================================

  @Post('resumes/parse')
  async parseResume(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) parseDto: ResumeParseRequestDto,
  ): Promise<ResumeParseResponseDto> {
    return this.candidateService.parseResume(user.id, parseDto);
  }

  @Get('resumes/:id/analysis')
  async getResumeAnalysis(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') resumeId: string,
  ): Promise<ResumeAnalysisResponseDto> {
    return this.candidateService.getResumeAnalysis(user.id, resumeId);
  }

  @Post('resumes/:id/optimize')
  async optimizeResume(
    @GetCurrentUser() user: CurrentUser,
    @Param('id') resumeId: string,
  ): Promise<ResumeOptimizationResponseDto> {
    return this.candidateService.optimizeResume(user.id, resumeId);
  }
}
