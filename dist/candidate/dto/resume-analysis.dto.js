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
exports.ResumeOptimizationResponseDto = exports.ResumeAnalysisResponseDto = exports.ResumeParseResponseDto = exports.ResumeParseRequestDto = void 0;
const class_validator_1 = require("class-validator");
class ResumeParseRequestDto {
    resumeId;
    filePath;
    forceReparse;
}
exports.ResumeParseRequestDto = ResumeParseRequestDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Resume ID must be a string' }),
    __metadata("design:type", String)
], ResumeParseRequestDto.prototype, "resumeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'File path must be a string' }),
    __metadata("design:type", String)
], ResumeParseRequestDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Force reparse must be a boolean' }),
    __metadata("design:type", Boolean)
], ResumeParseRequestDto.prototype, "forceReparse", void 0);
class ResumeParseResponseDto {
    success;
    extractedData;
    confidence;
    message;
}
exports.ResumeParseResponseDto = ResumeParseResponseDto;
class ResumeAnalysisResponseDto {
    resumeId;
    overallScore;
    sections;
    recommendations;
    strengths;
    weaknesses;
    atsCompatibility;
    analyzedAt;
}
exports.ResumeAnalysisResponseDto = ResumeAnalysisResponseDto;
class ResumeOptimizationResponseDto {
    resumeId;
    optimizationSuggestions;
    keywordOptimization;
    formattingSuggestions;
    lengthOptimization;
    atsOptimization;
    generatedAt;
}
exports.ResumeOptimizationResponseDto = ResumeOptimizationResponseDto;
//# sourceMappingURL=resume-analysis.dto.js.map