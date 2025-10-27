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
exports.PincodeResponseDto = exports.UpdatePincodeDto = exports.CreatePincodeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePincodeDto {
    code;
    area;
    cityId;
    isActive;
}
exports.CreatePincodeDto = CreatePincodeDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Code must be a string' }),
    (0, class_validator_1.MinLength)(3, { message: 'Code must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(10, { message: 'Code must not exceed 10 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreatePincodeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Area must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Area must not exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreatePincodeDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'City ID must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePincodeDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreatePincodeDto.prototype, "isActive", void 0);
class UpdatePincodeDto {
    code;
    area;
    cityId;
    isActive;
}
exports.UpdatePincodeDto = UpdatePincodeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Code must be a string' }),
    (0, class_validator_1.MinLength)(3, { message: 'Code must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(10, { message: 'Code must not exceed 10 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdatePincodeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Area must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Area must not exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdatePincodeDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'City ID must be a number' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdatePincodeDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdatePincodeDto.prototype, "isActive", void 0);
class PincodeResponseDto {
    id;
    code;
    area;
    cityId;
    isActive;
    createdAt;
    updatedAt;
    city;
}
exports.PincodeResponseDto = PincodeResponseDto;
//# sourceMappingURL=pincode.dto.js.map