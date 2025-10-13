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
exports.BulkDownloadResponseDto = exports.BulkDownloadDto = exports.ResumeStatsResponseDto = exports.ResumesListResponseDto = exports.AdminResumeResponseDto = exports.ResumeQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ResumeQueryDto {
    search;
    candidateId;
    isDefault;
    sortBy;
    sortOrder;
    page;
    limit;
}
exports.ResumeQueryDto = ResumeQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Candidate ID must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is default must be a boolean' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    __metadata("design:type", Boolean)
], ResumeQueryDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort by must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort order must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Page must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Limit must be a string' }),
    __metadata("design:type", String)
], ResumeQueryDto.prototype, "limit", void 0);
class AdminResumeResponseDto {
    id;
    candidateId;
    title;
    fileName;
    filePath;
    fileSize;
    mimeType;
    isDefault;
    uploadedAt;
    updatedAt;
    candidate;
}
exports.AdminResumeResponseDto = AdminResumeResponseDto;
class ResumesListResponseDto {
    resumes;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
}
exports.ResumesListResponseDto = ResumesListResponseDto;
class ResumeStatsResponseDto {
    total;
    byMimeType;
    averageFileSize;
    recentUploads;
    defaultResumes;
}
exports.ResumeStatsResponseDto = ResumeStatsResponseDto;
class BulkDownloadDto {
    resumeIds;
}
exports.BulkDownloadDto = BulkDownloadDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Resume IDs must be an array' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Each resume ID must be a valid UUID' }),
    __metadata("design:type", Array)
], BulkDownloadDto.prototype, "resumeIds", void 0);
class BulkDownloadResponseDto {
    success;
    message;
    data;
}
exports.BulkDownloadResponseDto = BulkDownloadResponseDto;
//# sourceMappingURL=admin-resume.dto.js.map