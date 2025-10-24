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
exports.UpdateJobDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateJobDto {
    title;
    description;
    requirements;
    responsibilities;
    benefits;
    minSalary;
    maxSalary;
    currency;
    jobType;
    workMode;
    experienceLevel;
    companyName;
    cityId;
    skillsRequired;
    tags;
    applicationDeadline;
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
    (0, class_validator_1.IsString)({ message: 'Currency must be a string' }),
    (0, class_validator_1.Length)(3, 3, { message: 'Currency must be 3 characters (e.g., USD, EUR)' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "currency", void 0);
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
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City ID must be a string' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Skills must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each skill must be a string' }),
    __metadata("design:type", Array)
], UpdateJobDto.prototype, "skillsRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Tags must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each tag must be a string' }),
    __metadata("design:type", Array)
], UpdateJobDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Application deadline must be a valid date' }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "applicationDeadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['DRAFT', 'PUBLISHED', 'CLOSED'], {
        message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED',
    }),
    __metadata("design:type", String)
], UpdateJobDto.prototype, "status", void 0);
//# sourceMappingURL=update-job.dto.js.map