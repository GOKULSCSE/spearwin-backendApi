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
exports.CandidateExperienceResponseDto = exports.UpdateCandidateExperienceDto = exports.CreateCandidateExperienceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCandidateExperienceDto {
    company;
    position;
    description;
    startDate;
    endDate;
    isCurrent;
    location;
    achievements;
}
exports.CreateCandidateExperienceDto = CreateCandidateExperienceDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Company must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Position must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Start date must be a valid date' }),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'End date must be a valid date' }),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is current must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCandidateExperienceDto.prototype, "isCurrent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Achievements must be a string' }),
    __metadata("design:type", String)
], CreateCandidateExperienceDto.prototype, "achievements", void 0);
class UpdateCandidateExperienceDto {
    company;
    position;
    description;
    startDate;
    endDate;
    isCurrent;
    location;
    achievements;
}
exports.UpdateCandidateExperienceDto = UpdateCandidateExperienceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Company must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Position must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Start date must be a valid date' }),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'End date must be a valid date' }),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is current must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdateCandidateExperienceDto.prototype, "isCurrent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Location must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Achievements must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateExperienceDto.prototype, "achievements", void 0);
class CandidateExperienceResponseDto {
    id;
    candidateId;
    company;
    position;
    description;
    startDate;
    endDate;
    isCurrent;
    location;
    achievements;
    createdAt;
}
exports.CandidateExperienceResponseDto = CandidateExperienceResponseDto;
//# sourceMappingURL=candidate-experience.dto.js.map