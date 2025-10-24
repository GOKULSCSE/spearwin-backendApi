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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkExportResponseDto = exports.BulkExportQueryDto = exports.BulkUpdateResponseDto = exports.BulkUpdateApplicationsDto = exports.ApplicationStatsResponseDto = exports.ApplicationsListResponseDto = exports.AdminApplicationResponseDto = exports.ApplicationQueryDto = exports.AddApplicationFeedbackDto = exports.UpdateApplicationStatusDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateApplicationStatusDto {
    status;
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Status is required' }),
    (0, class_validator_1.IsEnum)(client_1.ApplicationStatus, { message: 'Invalid application status' }),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
class AddApplicationFeedbackDto {
    feedback;
}
exports.AddApplicationFeedbackDto = AddApplicationFeedbackDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Feedback is required' }),
    (0, class_validator_1.IsString)({ message: 'Feedback must be a string' }),
    __metadata("design:type", String)
], AddApplicationFeedbackDto.prototype, "feedback", void 0);
class ApplicationQueryDto {
    status;
    jobTitle;
    companyName;
    candidateName;
    appliedFrom;
    appliedTo;
    page;
    limit;
}
exports.ApplicationQueryDto = ApplicationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Status must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job title must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Candidate name must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "candidateName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Applied from date must be a valid date (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "appliedFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Applied to date must be a valid date (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "appliedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Page must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Limit must be a string' }),
    __metadata("design:type", String)
], ApplicationQueryDto.prototype, "limit", void 0);
class AdminApplicationResponseDto {
    id;
    jobId;
    candidateId;
    resumeId;
    coverLetter;
    status;
    appliedAt;
    reviewedAt;
    reviewedBy;
    feedback;
    updatedAt;
    job;
    candidate;
    resume;
}
exports.AdminApplicationResponseDto = AdminApplicationResponseDto;
class ApplicationsListResponseDto {
    applications;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.ApplicationsListResponseDto = ApplicationsListResponseDto;
class ApplicationStatsResponseDto {
    total;
    byStatus;
    byJobType;
    byExperienceLevel;
    recentApplications;
    averageResponseTime;
}
exports.ApplicationStatsResponseDto = ApplicationStatsResponseDto;
class BulkUpdateApplicationsDto {
    applicationIds;
    status;
    feedback;
}
exports.BulkUpdateApplicationsDto = BulkUpdateApplicationsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Application IDs are required' }),
    (0, class_validator_1.IsString)({ message: 'Application IDs must be an array of strings' }),
    __metadata("design:type", Array)
], BulkUpdateApplicationsDto.prototype, "applicationIds", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Status is required' }),
    (0, class_validator_1.IsEnum)(client_1.ApplicationStatus, { message: 'Invalid application status' }),
    __metadata("design:type", String)
], BulkUpdateApplicationsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Feedback must be a string' }),
    __metadata("design:type", String)
], BulkUpdateApplicationsDto.prototype, "feedback", void 0);
class BulkUpdateResponseDto {
    success;
    updatedCount;
    failedCount;
    failedApplications;
    message;
}
exports.BulkUpdateResponseDto = BulkUpdateResponseDto;
class BulkExportQueryDto {
    status;
    jobTitle;
    companyName;
    candidateName;
    appliedFrom;
    appliedTo;
    format;
}
exports.BulkExportQueryDto = BulkExportQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Status must be a string' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job title must be a string' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Candidate name must be a string' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "candidateName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Applied from date must be a valid date (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "appliedFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Applied to date must be a valid date (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "appliedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Format must be csv or excel' }),
    __metadata("design:type", String)
], BulkExportQueryDto.prototype, "format", void 0);
class BulkExportResponseDto {
    success;
    downloadUrl;
    fileName;
    totalExported;
    message;
}
exports.BulkExportResponseDto = BulkExportResponseDto;
//# sourceMappingURL=admin-application.dto.js.map