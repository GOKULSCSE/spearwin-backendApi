import { DatabaseService } from '../database/database.service';
import { Multer } from 'multer';
import { UpdateCandidateProfileDto, UpdateAvailabilityDto, CandidateProfileResponseDto } from './dto/candidate-profile.dto';
import { CreateCandidateSkillDto, UpdateCandidateSkillDto, CandidateSkillResponseDto } from './dto/candidate-skill.dto';
import { CreateCandidateEducationDto, UpdateCandidateEducationDto, CandidateEducationResponseDto } from './dto/candidate-education.dto';
import { CreateCandidateExperienceDto, UpdateCandidateExperienceDto, CandidateExperienceResponseDto } from './dto/candidate-experience.dto';
import { CreateJobAlertDto, UpdateJobAlertDto, JobAlertResponseDto, RecommendedJobsResponseDto, JobAlertsResponseDto } from './dto/job-alert.dto';
import { UpdateApplicationDto, ApplicationResponseDto, ApplicationsResponseDto, ApplicationHistoryQueryDto } from './dto/job-application.dto';
import { ResumeParseRequestDto, ResumeParseResponseDto, ResumeAnalysisResponseDto, ResumeOptimizationResponseDto } from './dto/resume-analysis.dto';
export declare class CandidateService {
    private readonly db;
    constructor(db: DatabaseService);
    createCandidate(userId: string, createDto: any): Promise<CandidateProfileResponseDto>;
    getCandidateProfile(userId: string): Promise<CandidateProfileResponseDto>;
    updateCandidate(userId: string, updateDto: any): Promise<CandidateProfileResponseDto>;
    parseResume(userId: string, parseDto: ResumeParseRequestDto): Promise<ResumeParseResponseDto>;
    getResumeAnalysis(userId: string, resumeId: string): Promise<ResumeAnalysisResponseDto>;
    optimizeResume(userId: string, resumeId: string): Promise<ResumeOptimizationResponseDto>;
    private calculatePersonalInfoScore;
    private calculateExperienceScore;
    private calculateEducationScore;
    private calculateSkillsScore;
    private calculateSummaryScore;
    private calculateCompleteness;
    private getNestedValue;
    private getPersonalInfoIssues;
    private calculateExperienceRelevance;
    private calculateAchievementsScore;
    private getExperienceIssues;
    private calculateEducationRelevance;
    private getEducationIssues;
    private calculateSkillsRelevance;
    private calculateSkillsDiversity;
    private getSkillsIssues;
    private calculateSummaryImpact;
    private getSummaryIssues;
    private generateRecommendations;
    private identifyStrengths;
    private identifyWeaknesses;
    private calculateATSCompatibility;
    private getATSIssues;
    private getATSSuggestions;
    private generateOptimizationSuggestions;
    private generateKeywordOptimization;
    private generateFormattingSuggestions;
    private generateLengthOptimization;
    private estimateResumeLength;
    private logActivity;
    updateCandidateProfile(userId: string, updateDto: UpdateCandidateProfileDto): Promise<CandidateProfileResponseDto>;
    uploadProfilePicture(userId: string, file: Multer.File): Promise<{
        message: string;
        profilePicture: string;
    }>;
    deleteProfilePicture(userId: string): Promise<{
        message: string;
    }>;
    updateAvailability(userId: string, updateDto: UpdateAvailabilityDto): Promise<{
        message: string;
    }>;
    getCandidateSkills(userId: string): Promise<CandidateSkillResponseDto[]>;
    addCandidateSkill(userId: string, createDto: CreateCandidateSkillDto): Promise<CandidateSkillResponseDto>;
    updateCandidateSkill(userId: string, skillId: string, updateDto: UpdateCandidateSkillDto): Promise<CandidateSkillResponseDto>;
    deleteCandidateSkill(userId: string, skillId: string): Promise<{
        message: string;
    }>;
    getCandidateEducation(userId: string): Promise<CandidateEducationResponseDto[]>;
    addCandidateEducation(userId: string, createDto: CreateCandidateEducationDto): Promise<CandidateEducationResponseDto>;
    updateCandidateEducation(userId: string, educationId: string, updateDto: UpdateCandidateEducationDto): Promise<CandidateEducationResponseDto>;
    deleteCandidateEducation(userId: string, educationId: string): Promise<{
        message: string;
    }>;
    getCandidateExperience(userId: string): Promise<CandidateExperienceResponseDto[]>;
    addCandidateExperience(userId: string, createDto: CreateCandidateExperienceDto): Promise<CandidateExperienceResponseDto>;
    updateCandidateExperience(userId: string, experienceId: string, updateDto: UpdateCandidateExperienceDto): Promise<CandidateExperienceResponseDto>;
    deleteCandidateExperience(userId: string, experienceId: string): Promise<{
        message: string;
    }>;
    getRecommendedJobs(userId: string, query: any): Promise<RecommendedJobsResponseDto>;
    getJobAlerts(userId: string, query: any): Promise<JobAlertsResponseDto>;
    createJobAlert(userId: string, createDto: CreateJobAlertDto): Promise<JobAlertResponseDto>;
    updateJobAlert(userId: string, alertId: string, updateDto: UpdateJobAlertDto): Promise<JobAlertResponseDto>;
    getCandidateApplications(userId: string, query: any): Promise<ApplicationsResponseDto>;
    getApplicationHistory(userId: string, query: ApplicationHistoryQueryDto): Promise<ApplicationsResponseDto>;
    getApplicationDetails(userId: string, applicationId: string): Promise<ApplicationResponseDto>;
    updateApplication(userId: string, applicationId: string, updateDto: UpdateApplicationDto): Promise<ApplicationResponseDto>;
    private handleException;
}
