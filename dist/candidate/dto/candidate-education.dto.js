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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateEducationResponseDto = exports.UpdateCandidateEducationDto = exports.CreateCandidateEducationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateCandidateEducationDto {
    institution;
    degree;
    fieldOfStudy;
    level;
    startDate;
    endDate;
    isCompleted;
    grade;
    description;
}
exports.CreateCandidateEducationDto = CreateCandidateEducationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Institution must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "institution", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Degree must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "degree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Field of study must be a string' }),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "fieldOfStudy", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.EducationLevel, {
        message: 'Level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
    }),
    __metadata("design:type", typeof (_a = typeof client_1.EducationLevel !== "undefined" && client_1.EducationLevel) === "function" ? _a : Object)
], CreateCandidateEducationDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Start date must be a valid date' }),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'End date must be a valid date' }),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is completed must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCandidateEducationDto.prototype, "isCompleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Grade must be a string' }),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "grade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], CreateCandidateEducationDto.prototype, "description", void 0);
class UpdateCandidateEducationDto {
    institution;
    degree;
    fieldOfStudy;
    level;
    startDate;
    endDate;
    isCompleted;
    grade;
    description;
}
exports.UpdateCandidateEducationDto = UpdateCandidateEducationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Institution must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "institution", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Degree must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "degree", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Field of study must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "fieldOfStudy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EducationLevel, {
        message: 'Level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
    }),
    __metadata("design:type", typeof (_b = typeof client_1.EducationLevel !== "undefined" && client_1.EducationLevel) === "function" ? _b : Object)
], UpdateCandidateEducationDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Start date must be a valid date' }),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'End date must be a valid date' }),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is completed must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdateCandidateEducationDto.prototype, "isCompleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Grade must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "grade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateEducationDto.prototype, "description", void 0);
class CandidateEducationResponseDto {
    id;
    candidateId;
    institution;
    degree;
    fieldOfStudy;
    level;
    startDate;
    endDate;
    isCompleted;
    grade;
    description;
    createdAt;
}
exports.CandidateEducationResponseDto = CandidateEducationResponseDto;
//# sourceMappingURL=candidate-education.dto.js.map