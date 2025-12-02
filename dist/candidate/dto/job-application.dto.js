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
exports.ApplicationHistoryQueryDto = exports.ApplicationsResponseDto = exports.ApplicationResponseDto = exports.UpdateApplicationDto = exports.ApplyForJobDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ApplyForJobDto {
    resumeId;
    resumeFilePath;
    coverLetter;
    fullName;
    email;
    phone;
    location;
    experienceLevel;
    noticePeriod;
    currentCTC;
    expectedCTC;
}
exports.ApplyForJobDto = ApplyForJobDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Resume ID must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "resumeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Resume file path must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "resumeFilePath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Cover letter must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "coverLetter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Full name must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Email must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Experience level must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notice period must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "noticePeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Current CTC must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "currentCTC", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Expected CTC must be a string' }),
    __metadata("design:type", String)
], ApplyForJobDto.prototype, "expectedCTC", void 0);
class UpdateApplicationDto {
    coverLetter;
    status;
}
exports.UpdateApplicationDto = UpdateApplicationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Cover letter must be a string' }),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "coverLetter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ApplicationStatus, { message: 'Invalid application status' }),
    __metadata("design:type", String)
], UpdateApplicationDto.prototype, "status", void 0);
class ApplicationResponseDto {
    id;
    jobId;
    candidateId;
    resumeId;
    resumeFilePath;
    coverLetter;
    status;
    appliedAt;
    reviewedAt;
    reviewedBy;
    feedback;
    fullName;
    email;
    phone;
    location;
    experienceLevel;
    noticePeriod;
    currentCTC;
    expectedCTC;
    updatedAt;
    job;
    resume;
}
exports.ApplicationResponseDto = ApplicationResponseDto;
class ApplicationsResponseDto {
    applications;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.ApplicationsResponseDto = ApplicationsResponseDto;
class ApplicationHistoryQueryDto {
    status;
    jobTitle;
    companyName;
    appliedFrom;
    appliedTo;
    page;
    limit;
}
exports.ApplicationHistoryQueryDto = ApplicationHistoryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Status must be a string' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job title must be a string' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Applied from date must be a string (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "appliedFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Applied to date must be a string (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "appliedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Page must be a string' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Limit must be a string' }),
    __metadata("design:type", String)
], ApplicationHistoryQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=job-application.dto.js.map