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
exports.CandidateProfileResponseDto = exports.UpdateAvailabilityDto = exports.UpdateCandidateProfileDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateCandidateProfileDto {
    firstName;
    lastName;
    fatherName;
    dateOfBirth;
    gender;
    maritalStatus;
    bio;
    currentTitle;
    currentCompany;
    currentLocation;
    preferredLocation;
    noticePeriod;
    currentSalary;
    expectedSalary;
    profileType;
    experienceYears;
    cityId;
    address;
    linkedinUrl;
    githubUrl;
    portfolioUrl;
}
exports.UpdateCandidateProfileDto = UpdateCandidateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'First name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Last name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Father name must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "fatherName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date of birth must be a valid date' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Gender must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Marital status must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Bio must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Current title must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "currentTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Current company must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "currentCompany", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Current location must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "currentLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Preferred location must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "preferredLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notice period must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "noticePeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Current salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Current salary must be at least 0' }),
    __metadata("design:type", Number)
], UpdateCandidateProfileDto.prototype, "currentSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Expected salary must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Expected salary must be at least 0' }),
    __metadata("design:type", Number)
], UpdateCandidateProfileDto.prototype, "expectedSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Profile type must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "profileType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Experience years must be a number' }),
    (0, class_validator_1.Min)(0, { message: 'Experience years must be at least 0' }),
    (0, class_validator_1.Max)(50, { message: 'Experience years must not exceed 50' }),
    __metadata("design:type", Number)
], UpdateCandidateProfileDto.prototype, "experienceYears", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'City ID must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'LinkedIn URL must be a valid URL' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'GitHub URL must be a valid URL' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "githubUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Portfolio URL must be a valid URL' }),
    __metadata("design:type", String)
], UpdateCandidateProfileDto.prototype, "portfolioUrl", void 0);
class UpdateAvailabilityDto {
    isAvailable;
}
exports.UpdateAvailabilityDto = UpdateAvailabilityDto;
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'Is available must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdateAvailabilityDto.prototype, "isAvailable", void 0);
class CandidateProfileResponseDto {
    id;
    userId;
    firstName;
    lastName;
    fatherName;
    dateOfBirth;
    gender;
    maritalStatus;
    profilePicture;
    bio;
    currentTitle;
    currentCompany;
    currentLocation;
    preferredLocation;
    noticePeriod;
    currentSalary;
    expectedSalary;
    profileType;
    experienceYears;
    address;
    linkedinUrl;
    githubUrl;
    portfolioUrl;
    isAvailable;
    createdAt;
    updatedAt;
    user;
    city;
}
exports.CandidateProfileResponseDto = CandidateProfileResponseDto;
//# sourceMappingURL=candidate-profile.dto.js.map