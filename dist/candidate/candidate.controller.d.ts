import { CandidateService } from './candidate.service';
import { UpdateCandidateProfileDto, UpdateAvailabilityDto, type CandidateProfileResponseDto } from './dto/candidate-profile.dto';
import { CreateCandidateSkillDto, UpdateCandidateSkillDto, type CandidateSkillResponseDto } from './dto/candidate-skill.dto';
import { CreateCandidateEducationDto, UpdateCandidateEducationDto, type CandidateEducationResponseDto } from './dto/candidate-education.dto';
import { CreateCandidateExperienceDto, UpdateCandidateExperienceDto, type CandidateExperienceResponseDto } from './dto/candidate-experience.dto';
import { CreateJobAlertDto, UpdateJobAlertDto, JobAlertResponseDto, RecommendedJobsResponseDto, JobAlertsResponseDto } from './dto/job-alert.dto';
import { ApplyForJobDto, UpdateApplicationDto, ApplicationResponseDto, ApplicationsResponseDto, ApplicationHistoryQueryDto } from './dto/job-application.dto';
import { ResumeParseRequestDto, ResumeParseResponseDto, ResumeAnalysisResponseDto, ResumeOptimizationResponseDto } from './dto/resume-analysis.dto';
import { UpsertFullProfileDto } from './dto/upsert-full-profile.dto';
import { CandidateCompleteProfileResponseDto } from './dto/candidate-complete-profile.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { type CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class CandidateController {
    private readonly candidateService;
    constructor(candidateService: CandidateService);
    getCandidateProfile(user: CurrentUser): Promise<CandidateProfileResponseDto>;
    getDashboardStats(user: CurrentUser): Promise<DashboardStatsDto>;
    createCandidateProfile(user: CurrentUser, createDto: UpdateCandidateProfileDto): Promise<CandidateProfileResponseDto>;
    updateCandidateProfile(user: CurrentUser, updateDto: UpdateCandidateProfileDto): Promise<CandidateProfileResponseDto>;
    upsertFullProfile(user: CurrentUser, body: UpsertFullProfileDto): Promise<CandidateProfileResponseDto>;
    getCompleteProfile(user: CurrentUser): Promise<CandidateCompleteProfileResponseDto>;
    uploadProfilePicture(user: CurrentUser, file: Express.Multer.File): Promise<{
        message: string;
        profilePicture: string;
    }>;
    deleteProfilePicture(user: CurrentUser): Promise<{
        message: string;
    }>;
    updateAvailability(user: CurrentUser, updateDto: UpdateAvailabilityDto): Promise<{
        message: string;
    }>;
    changePassword(user: CurrentUser, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getCandidateSkills(user: CurrentUser): Promise<CandidateSkillResponseDto[]>;
    addCandidateSkill(user: CurrentUser, createDto: CreateCandidateSkillDto): Promise<CandidateSkillResponseDto>;
    updateCandidateSkill(user: CurrentUser, skillId: string, updateDto: UpdateCandidateSkillDto): Promise<CandidateSkillResponseDto>;
    deleteCandidateSkill(user: CurrentUser, skillId: string): Promise<{
        message: string;
    }>;
    getCandidateEducation(user: CurrentUser): Promise<CandidateEducationResponseDto[]>;
    addCandidateEducation(user: CurrentUser, createDto: CreateCandidateEducationDto): Promise<CandidateEducationResponseDto>;
    updateCandidateEducation(user: CurrentUser, educationId: string, updateDto: UpdateCandidateEducationDto): Promise<CandidateEducationResponseDto>;
    deleteCandidateEducation(user: CurrentUser, educationId: string): Promise<{
        message: string;
    }>;
    getCandidateExperience(user: CurrentUser): Promise<CandidateExperienceResponseDto[]>;
    addCandidateExperience(user: CurrentUser, createDto: CreateCandidateExperienceDto): Promise<CandidateExperienceResponseDto>;
    updateCandidateExperience(user: CurrentUser, experienceId: string, updateDto: UpdateCandidateExperienceDto): Promise<CandidateExperienceResponseDto>;
    deleteCandidateExperience(user: CurrentUser, experienceId: string): Promise<{
        message: string;
    }>;
    getRecommendedJobs(user: CurrentUser, query: any): Promise<RecommendedJobsResponseDto>;
    getJobAlerts(user: CurrentUser, query: any): Promise<JobAlertsResponseDto>;
    createJobAlert(user: CurrentUser, createDto: CreateJobAlertDto): Promise<JobAlertResponseDto>;
    updateJobAlert(user: CurrentUser, alertId: string, updateDto: UpdateJobAlertDto): Promise<JobAlertResponseDto>;
    getFavoriteJobs(user: CurrentUser): Promise<any>;
    checkFavoriteJob(user: CurrentUser, jobId: string): Promise<{
        isFavorite: boolean;
    }>;
    addFavoriteJob(user: CurrentUser, jobId: string): Promise<{
        message: string;
        favoriteJob: any;
    }>;
    removeFavoriteJob(user: CurrentUser, jobId: string): Promise<{
        message: string;
    }>;
    applyForJob(user: CurrentUser, jobId: string, applyDto: ApplyForJobDto): Promise<ApplicationResponseDto>;
    getCandidateApplications(user: CurrentUser, query: any): Promise<ApplicationsResponseDto>;
    getApplicationHistory(user: CurrentUser, query: ApplicationHistoryQueryDto): Promise<ApplicationsResponseDto>;
    getApplicationDetails(user: CurrentUser, applicationId: string): Promise<ApplicationResponseDto>;
    updateApplication(user: CurrentUser, applicationId: string, updateDto: UpdateApplicationDto): Promise<ApplicationResponseDto>;
    parseResume(user: CurrentUser, parseDto: ResumeParseRequestDto): Promise<ResumeParseResponseDto>;
    getResumeAnalysis(user: CurrentUser, resumeId: string): Promise<ResumeAnalysisResponseDto>;
    optimizeResume(user: CurrentUser, resumeId: string): Promise<ResumeOptimizationResponseDto>;
}
