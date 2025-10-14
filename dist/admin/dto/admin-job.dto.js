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
exports.JobApplicationsResponseDto = exports.JobStatsResponseDto = exports.JobListQueryDto = exports.UpdateJobDto = exports.CreateJobDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateJobDto {
    title;
    description;
    requirements;
    responsibilities;
    benefits;
    companyId;
    cityId;
    address;
    jobType;
    workMode;
    experienceLevel;
    minExperience;
    maxExperience;
    minSalary;
    maxSalary;
    salaryNegotiable;
    skillsRequired;
    educationLevel;
    expiresAt;
    status = 'DRAFT';
}
exports.CreateJobDto = CreateJobDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.Length)(1, 200, { message: 'Title must be between 1 and 200 characters' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.Length)(10, 5000, {
        message: 'Description must be between 10 and 5000 characters',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Requirements must be a string' }),
    (0, class_validator_1.Length)(10, 2000, {
        message: 'Requirements must be between 10 and 2000 characters',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "requirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Responsibilities must be a string' }),
    (0, class_validator_1.Length)(10, 2000, {
        message: 'Responsibilities must be between 10 and 2000 characters',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "responsibilities", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Benefits must be a string' }),
    (0, class_validator_1.Length)(10, 1000, {
        message: 'Benefits must be between 10 and 1000 characters',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Company ID must be a string' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City ID must be a string' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'], {
        message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "jobType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['REMOTE', 'ONSITE', 'HYBRID'], {
        message: 'Work mode must be one of: REMOTE, ONSITE, HYBRID',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "workMode", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'], {
        message: 'Experience level must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Minimum experience must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Minimum experience must be positive' }),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "minExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Maximum experience must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Maximum experience must be positive' }),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "maxExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Minimum salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Minimum salary must be positive' }),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "minSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Maximum salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Maximum salary must be positive' }),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "maxSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Salary negotiable must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateJobDto.prototype, "salaryNegotiable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Skills must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each skill must be a string' }),
    __metadata("design:type", Array)
], CreateJobDto.prototype, "skillsRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'HIGH_SCHOOL',
        'DIPLOMA',
        'BACHELOR',
        'MASTER',
        'DOCTORATE',
        'PROFESSIONAL',
    ], {
        message: 'Education level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "educationLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Expires at must be a valid date' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'], {
        message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED, ARCHIVED',
    }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "status", void 0);
class UpdateJobDto {
    title;
    description;
    requirements;
    responsibilities;
    benefits;
    companyId;
    cityId;
    address;
    jobType;
    workMode;
    experienceLevel;
    minExperience;
    maxExperience;
    minSalary;
    maxSalary;
    salaryNegotiable;
    skillsRequired;
    educationLevel;
    expiresAt;
    status;
}
exports.UpdateJobDto = UpdateJobDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.Length)(1, 200, { message: 'Title must be between 1 and 200 characters' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.Length)(10, 5000, {
        message: 'Description must be between 10 and 5000 characters',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Requirements must be a string' }),
    (0, class_validator_1.Length)(10, 2000, {
        message: 'Requirements must be between 10 and 2000 characters',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "requirements", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Responsibilities must be a string' }),
    (0, class_validator_1.Length)(10, 2000, {
        message: 'Responsibilities must be between 10 and 2000 characters',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "responsibilities", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Benefits must be a string' }),
    (0, class_validator_1.Length)(10, 1000, {
        message: 'Benefits must be between 10 and 1000 characters',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company ID must be a string' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City ID must be a string' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'], {
        message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "jobType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['REMOTE', 'ONSITE', 'HYBRID'], {
        message: 'Work mode must be one of: REMOTE, ONSITE, HYBRID',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "workMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'], {
        message: 'Experience level must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "experienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Minimum experience must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Minimum experience must be positive' }),
    __metadata("design:type", Number)
], UpdateJobDto.prototype, "minExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Maximum experience must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Maximum experience must be positive' }),
    __metadata("design:type", Number)
], UpdateJobDto.prototype, "maxExperience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Minimum salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Minimum salary must be positive' }),
    __metadata("design:type", Number)
], UpdateJobDto.prototype, "minSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Maximum salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Maximum salary must be positive' }),
    __metadata("design:type", Number)
], UpdateJobDto.prototype, "maxSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Salary negotiable must be a boolean' }),
    __metadata("design:type", Boolean)
], UpdateJobDto.prototype, "salaryNegotiable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Skills must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each skill must be a string' }),
    __metadata("design:type", Array)
], UpdateJobDto.prototype, "skillsRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)([
        'HIGH_SCHOOL',
        'DIPLOMA',
        'BACHELOR',
        'MASTER',
        'DOCTORATE',
        'PROFESSIONAL',
    ], {
        message: 'Education level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "educationLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Expires at must be a valid date' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'], {
        message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED, ARCHIVED',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "status", void 0);
class JobListQueryDto {
    search;
    company;
    city;
    type;
    experience;
    status;
    page = 1;
    limit = 20;
    sortBy = 'createdAt';
    sortOrder = 'desc';
}
exports.JobListQueryDto = JobListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company ID must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City ID must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Job type must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Experience level must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Status must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Page must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], JobListQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Limit must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], JobListQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort by must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort order must be a string' }),
    __metadata("design:type", String)
], JobListQueryDto.prototype, "sortOrder", void 0);
class JobStatsResponseDto {
    totalJobs;
    publishedJobs;
    draftJobs;
    closedJobs;
    totalApplications;
    totalViews;
    averageApplicationsPerJob;
    averageViewsPerJob;
    recentApplications;
    recentViews;
}
exports.JobStatsResponseDto = JobStatsResponseDto;
class JobApplicationsResponseDto {
    applications;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.JobApplicationsResponseDto = JobApplicationsResponseDto;
//# sourceMappingURL=admin-job.dto.js.map