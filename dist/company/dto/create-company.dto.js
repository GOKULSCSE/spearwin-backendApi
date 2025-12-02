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
exports.CreateCompanyDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCompanyDto {
    name;
    slug;
    uuid;
    description;
    website;
    logo;
    industry;
    foundedYear;
    employeeCount;
    headquarters;
    country;
    state;
    city;
    address;
    linkedinUrl;
    twitterUrl;
    facebookUrl;
    isVerified;
    isActive;
}
exports.CreateCompanyDto = CreateCompanyDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must not exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Slug must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Slug must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Slug must not exceed 50 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-')),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'UUID must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "uuid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Description must not exceed 1000 characters' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Website must be a valid URL' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Logo must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Industry must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Founded year must be a number' }),
    __metadata("design:type", Number)
], CreateCompanyDto.prototype, "foundedYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Employee count must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "employeeCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Headquarters must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "headquarters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Country must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'State must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'LinkedIn URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Twitter URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "twitterUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Facebook URL must be a valid URL' }),
    __metadata("design:type", String)
], CreateCompanyDto.prototype, "facebookUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is verified must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCompanyDto.prototype, "isVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCompanyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-company.dto.js.map