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
exports.CandidateSkillResponseDto = exports.UpdateCandidateSkillDto = exports.CreateCandidateSkillDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCandidateSkillDto {
    skillName;
    level;
    yearsUsed;
}
exports.CreateCandidateSkillDto = CreateCandidateSkillDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Skill name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCandidateSkillDto.prototype, "skillName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Level must be a string' }),
    __metadata("design:type", String)
], CreateCandidateSkillDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Years used must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Years used must be at least 0' }),
    (0, class_validator_1.Max)(50, { message: 'Years used must not exceed 50' }),
    __metadata("design:type", Number)
], CreateCandidateSkillDto.prototype, "yearsUsed", void 0);
class UpdateCandidateSkillDto {
    skillName;
    level;
    yearsUsed;
}
exports.UpdateCandidateSkillDto = UpdateCandidateSkillDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Skill name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateSkillDto.prototype, "skillName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Level must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateSkillDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Years used must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Years used must be at least 0' }),
    (0, class_validator_1.Max)(50, { message: 'Years used must not exceed 50' }),
    __metadata("design:type", Number)
], UpdateCandidateSkillDto.prototype, "yearsUsed", void 0);
class CandidateSkillResponseDto {
    id;
    candidateId;
    skillName;
    level;
    yearsUsed;
}
exports.CandidateSkillResponseDto = CandidateSkillResponseDto;
//# sourceMappingURL=candidate-skill.dto.js.map