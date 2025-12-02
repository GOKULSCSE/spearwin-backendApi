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
exports.JobController = void 0;
const common_1 = require("@nestjs/common");
const job_service_1 = require("./job.service");
const job_query_dto_1 = require("./dto/job-query.dto");
const update_job_dto_1 = require("./dto/update-job.dto");
const job_application_dto_1 = require("../candidate/dto/job-application.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let JobController = class JobController {
    jobService;
    constructor(jobService) {
        this.jobService = jobService;
    }
    async getPublishedJobs(query) {
        return this.jobService.getPublishedJobs(query);
    }
    async searchJobs(searchQuery) {
        return this.jobService.searchJobs(searchQuery);
    }
    async getFeaturedJobs() {
        return this.jobService.getFeaturedJobs();
    }
    async getJobById(id) {
        return this.jobService.getJobById(id);
    }
    async getJobBySlug(slug) {
        return this.jobService.getJobBySlug(slug);
    }
    async incrementJobView(jobId) {
        return this.jobService.incrementJobView(jobId);
    }
    async getJobFilters() {
        return this.jobService.getJobFilters();
    }
    async applyForJob(jobId, user, applyDto) {
        return this.jobService.applyForJob(jobId, user.id, applyDto);
    }
    async updateJob(jobId, updateJobDto) {
        return this.jobService.updateJob(jobId, updateJobDto);
    }
};
exports.JobController = JobController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_query_dto_1.JobQueryDto]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getPublishedJobs", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_query_dto_1.JobSearchDto]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "searchJobs", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getFeaturedJobs", null);
__decorate([
    (0, common_1.Get)('id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getJobById", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getJobBySlug", null);
__decorate([
    (0, common_1.Post)(':id/view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "incrementJobView", null);
__decorate([
    (0, common_1.Get)('filters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getJobFilters", null);
__decorate([
    (0, common_1.Post)(':jobId/apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, job_application_dto_1.ApplyForJobDto]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "applyForJob", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_job_dto_1.UpdateJobDto]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "updateJob", null);
exports.JobController = JobController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [job_service_1.JobService])
], JobController);
//# sourceMappingURL=job.controller.js.map