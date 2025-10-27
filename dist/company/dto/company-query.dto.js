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
exports.CompanyQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CompanyQueryDto {
    search;
    industry;
    country;
    state;
    city;
    isVerified;
    isActive;
    page = 1;
    limit = 10;
    sortBy = 'createdAt';
    sortOrder = 'desc';
}
exports.CompanyQueryDto = CompanyQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Industry must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Country must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'State must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is verified must be a boolean value' }),
    __metadata("design:type", Boolean)
], CompanyQueryDto.prototype, "isVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], CompanyQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Page must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], CompanyQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Limit must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], CompanyQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort by must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort order must be a string' }),
    __metadata("design:type", String)
], CompanyQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=company-query.dto.js.map