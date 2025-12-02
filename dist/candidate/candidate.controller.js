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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const candidate_service_1 = require("./candidate.service");
const candidate_profile_dto_1 = require("./dto/candidate-profile.dto");
const candidate_skill_dto_1 = require("./dto/candidate-skill.dto");
const candidate_education_dto_1 = require("./dto/candidate-education.dto");
const candidate_experience_dto_1 = require("./dto/candidate-experience.dto");
const job_alert_dto_1 = require("./dto/job-alert.dto");
const job_application_dto_1 = require("./dto/job-application.dto");
const resume_analysis_dto_1 = require("./dto/resume-analysis.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let CandidateController = class CandidateController {
    candidateService;
    constructor(candidateService) {
        this.candidateService = candidateService;
    }
    async getCandidateProfile(user) {
        return this.candidateService.getCandidateProfile(user.id);
    }
    async updateCandidateProfile(user, updateDto) {
        return this.candidateService.updateCandidateProfile(user.id, updateDto);
    }
    async uploadProfilePicture(user, file) {
        return this.candidateService.uploadProfilePicture(user.id, file);
    }
    async deleteProfilePicture(user) {
        return this.candidateService.deleteProfilePicture(user.id);
    }
    async updateAvailability(user, updateDto) {
        return this.candidateService.updateAvailability(user.id, updateDto);
    }
    async getCandidateSkills(user) {
        return this.candidateService.getCandidateSkills(user.id);
    }
    async addCandidateSkill(user, createDto) {
        return this.candidateService.addCandidateSkill(user.id, createDto);
    }
    async updateCandidateSkill(user, skillId, updateDto) {
        return this.candidateService.updateCandidateSkill(user.id, skillId, updateDto);
    }
    async deleteCandidateSkill(user, skillId) {
        return this.candidateService.deleteCandidateSkill(user.id, skillId);
    }
    async getCandidateEducation(user) {
        return this.candidateService.getCandidateEducation(user.id);
    }
    async addCandidateEducation(user, createDto) {
        return this.candidateService.addCandidateEducation(user.id, createDto);
    }
    async updateCandidateEducation(user, educationId, updateDto) {
        return this.candidateService.updateCandidateEducation(user.id, educationId, updateDto);
    }
    async deleteCandidateEducation(user, educationId) {
        return this.candidateService.deleteCandidateEducation(user.id, educationId);
    }
    async getCandidateExperience(user) {
        return this.candidateService.getCandidateExperience(user.id);
    }
    async addCandidateExperience(user, createDto) {
        return this.candidateService.addCandidateExperience(user.id, createDto);
    }
    async updateCandidateExperience(user, experienceId, updateDto) {
        return this.candidateService.updateCandidateExperience(user.id, experienceId, updateDto);
    }
    async deleteCandidateExperience(user, experienceId) {
        return this.candidateService.deleteCandidateExperience(user.id, experienceId);
    }
    async getRecommendedJobs(user, query) {
        return this.candidateService.getRecommendedJobs(user.id, query);
    }
    async getJobAlerts(user, query) {
        return this.candidateService.getJobAlerts(user.id, query);
    }
    async createJobAlert(user, createDto) {
        return this.candidateService.createJobAlert(user.id, createDto);
    }
    async updateJobAlert(user, alertId, updateDto) {
        return this.candidateService.updateJobAlert(user.id, alertId, updateDto);
    }
    async getCandidateApplications(user, query) {
        return this.candidateService.getCandidateApplications(user.id, query);
    }
    async getApplicationHistory(user, query) {
        return this.candidateService.getApplicationHistory(user.id, query);
    }
    async getApplicationDetails(user, applicationId) {
        return this.candidateService.getApplicationDetails(user.id, applicationId);
    }
    async updateApplication(user, applicationId, updateDto) {
        return this.candidateService.updateApplication(user.id, applicationId, updateDto);
    }
    async parseResume(user, parseDto) {
        return this.candidateService.parseResume(user.id, parseDto);
    }
    async getResumeAnalysis(user, resumeId) {
        return this.candidateService.getResumeAnalysis(user.id, resumeId);
    }
    async optimizeResume(user, resumeId) {
        return this.candidateService.optimizeResume(user.id, resumeId);
    }
};
exports.CandidateController = CandidateController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, candidate_profile_dto_1.UpdateCandidateProfileDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidateProfile", null);
__decorate([
    (0, common_1.Post)('profile/picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof multer_1.Multer !== "undefined" && multer_1.Multer.File) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Delete)('profile/picture'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteProfilePicture", null);
__decorate([
    (0, common_1.Put)('availability'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, candidate_profile_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Get)('skills'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateSkills", null);
__decorate([
    (0, common_1.Post)('skills'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, candidate_skill_dto_1.CreateCandidateSkillDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "addCandidateSkill", null);
__decorate([
    (0, common_1.Put)('skills/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, candidate_skill_dto_1.UpdateCandidateSkillDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidateSkill", null);
__decorate([
    (0, common_1.Delete)('skills/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteCandidateSkill", null);
__decorate([
    (0, common_1.Get)('education'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateEducation", null);
__decorate([
    (0, common_1.Post)('education'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, candidate_education_dto_1.CreateCandidateEducationDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "addCandidateEducation", null);
__decorate([
    (0, common_1.Put)('education/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, candidate_education_dto_1.UpdateCandidateEducationDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidateEducation", null);
__decorate([
    (0, common_1.Delete)('education/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteCandidateEducation", null);
__decorate([
    (0, common_1.Get)('experience'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateExperience", null);
__decorate([
    (0, common_1.Post)('experience'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, candidate_experience_dto_1.CreateCandidateExperienceDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "addCandidateExperience", null);
__decorate([
    (0, common_1.Put)('experience/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, candidate_experience_dto_1.UpdateCandidateExperienceDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidateExperience", null);
__decorate([
    (0, common_1.Delete)('experience/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteCandidateExperience", null);
__decorate([
    (0, common_1.Get)('recommended-jobs'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getRecommendedJobs", null);
__decorate([
    (0, common_1.Get)('job-alerts'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getJobAlerts", null);
__decorate([
    (0, common_1.Post)('job-alerts'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, job_alert_dto_1.CreateJobAlertDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "createJobAlert", null);
__decorate([
    (0, common_1.Put)('job-alerts/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, job_alert_dto_1.UpdateJobAlertDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateJobAlert", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidateApplications", null);
__decorate([
    (0, common_1.Get)('application-history'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, job_application_dto_1.ApplicationHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getApplicationHistory", null);
__decorate([
    (0, common_1.Get)('applications/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getApplicationDetails", null);
__decorate([
    (0, common_1.Put)('applications/:id'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, job_application_dto_1.UpdateApplicationDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateApplication", null);
__decorate([
    (0, common_1.Post)('resumes/parse'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, resume_analysis_dto_1.ResumeParseRequestDto]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "parseResume", null);
__decorate([
    (0, common_1.Get)('resumes/:id/analysis'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getResumeAnalysis", null);
__decorate([
    (0, common_1.Post)('resumes/:id/optimize'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "optimizeResume", null);
exports.CandidateController = CandidateController = __decorate([
    (0, common_1.Controller)('candidate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [candidate_service_1.CandidateService])
], CandidateController);
//# sourceMappingURL=candidate.controller.js.map