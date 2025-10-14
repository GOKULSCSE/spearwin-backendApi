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
exports.JobAlertsResponseDto = exports.RecommendedJobsResponseDto = exports.JobAlertResponseDto = exports.UpdateJobAlertDto = exports.CreateJobAlertDto = void 0;
const class_validator_1 = require("class-validator");
class CreateJobAlertDto {
    title;
    keywords;
    location;
    skills;
    jobType;
    experienceLevel;
    company;
    isActive = true;
    frequency = 'WEEKLY';
}
exports.CreateJobAlertDto = CreateJobAlertDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Title must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Keywords must be a string' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Skills must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each skill must be a string' }),
    __metadata("design:type", Array)
], CreateJobAlertDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job type must be a string' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "jobType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Experience level must be a string' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company must be a string' }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateJobAlertDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DAILY', 'WEEKLY', 'MONTHLY'], {
        message: 'Frequency must be one of: DAILY, WEEKLY, MONTHLY',
    }),
    __metadata("design:type", String)
], CreateJobAlertDto.prototype, "frequency", void 0);
class UpdateJobAlertDto {
    title;
    keywords;
    location;
    skills;
    jobType;
    experienceLevel;
    company;
    isActive;
    frequency;
}
exports.UpdateJobAlertDto = UpdateJobAlertDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Title must be between 1 and 100 characters' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Keywords must be a string' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Skills must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each skill must be a string' }),
    __metadata("design:type", Array)
], UpdateJobAlertDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job type must be a string' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "jobType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Experience level must be a string' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company must be a string' }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean' }),
    __metadata("design:type", Boolean)
], UpdateJobAlertDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DAILY', 'WEEKLY', 'MONTHLY'], {
        message: 'Frequency must be one of: DAILY, WEEKLY, MONTHLY',
    }),
    __metadata("design:type", String)
], UpdateJobAlertDto.prototype, "frequency", void 0);
class JobAlertResponseDto {
    id;
    candidateId;
    title;
    keywords;
    location;
    skills;
    jobType;
    experienceLevel;
    company;
    isActive;
    frequency;
    lastSentAt;
    createdAt;
    updatedAt;
}
exports.JobAlertResponseDto = JobAlertResponseDto;
class RecommendedJobsResponseDto {
    jobs;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.RecommendedJobsResponseDto = RecommendedJobsResponseDto;
class JobAlertsResponseDto {
    alerts;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.JobAlertsResponseDto = JobAlertsResponseDto;
//# sourceMappingURL=job-alert.dto.js.map