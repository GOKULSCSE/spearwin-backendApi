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
exports.CountryResponseDto = exports.UpdateCountryDto = exports.CreateCountryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCountryDto {
    name;
    iso3;
    iso2;
    numeric_code;
    phonecode;
    capital;
    currency;
    currency_name;
    currency_symbol;
    tld;
    native;
    region;
    region_id;
    subregion;
    subregion_id;
    nationality;
    latitude;
    longitude;
    isActive;
}
exports.CreateCountryDto = CreateCountryDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must not exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ISO3 must be a string' }),
    (0, class_validator_1.MaxLength)(3, { message: 'ISO3 must not exceed 3 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toUpperCase()),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "iso3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ISO2 must be a string' }),
    (0, class_validator_1.MaxLength)(2, { message: 'ISO2 must not exceed 2 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toUpperCase()),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "iso2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Numeric code must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "numeric_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone code must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "phonecode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Capital must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "capital", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency name must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "currency_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency symbol must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "currency_symbol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'TLD must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "tld", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Native must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "native", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Region must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Region ID must be a number' }),
    __metadata("design:type", Number)
], CreateCountryDto.prototype, "region_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Subregion must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "subregion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Subregion ID must be a number' }),
    __metadata("design:type", Number)
], CreateCountryDto.prototype, "subregion_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Nationality must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Latitude must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Longitude must be a string' }),
    __metadata("design:type", String)
], CreateCountryDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], CreateCountryDto.prototype, "isActive", void 0);
class UpdateCountryDto {
    name;
    iso3;
    iso2;
    numeric_code;
    phonecode;
    capital;
    currency;
    currency_name;
    currency_symbol;
    tld;
    native;
    region;
    region_id;
    subregion;
    subregion_id;
    nationality;
    latitude;
    longitude;
    isActive;
}
exports.UpdateCountryDto = UpdateCountryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must not exceed 100 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ISO3 must be a string' }),
    (0, class_validator_1.MaxLength)(3, { message: 'ISO3 must not exceed 3 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toUpperCase()),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "iso3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'ISO2 must be a string' }),
    (0, class_validator_1.MaxLength)(2, { message: 'ISO2 must not exceed 2 characters' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toUpperCase()),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "iso2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Numeric code must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "numeric_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone code must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "phonecode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Capital must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "capital", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency name must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "currency_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Currency symbol must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "currency_symbol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'TLD must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "tld", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Native must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "native", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Region must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Region ID must be a number' }),
    __metadata("design:type", Number)
], UpdateCountryDto.prototype, "region_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Subregion must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "subregion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Subregion ID must be a number' }),
    __metadata("design:type", Number)
], UpdateCountryDto.prototype, "subregion_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Nationality must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Latitude must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Longitude must be a string' }),
    __metadata("design:type", String)
], UpdateCountryDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is active must be a boolean value' }),
    __metadata("design:type", Boolean)
], UpdateCountryDto.prototype, "isActive", void 0);
class CountryResponseDto {
    id;
    name;
    iso3;
    iso2;
    numeric_code;
    phonecode;
    capital;
    currency;
    currency_name;
    currency_symbol;
    tld;
    native;
    region;
    region_id;
    subregion;
    subregion_id;
    nationality;
    latitude;
    longitude;
    isActive;
    createdAt;
    updatedAt;
    states;
}
exports.CountryResponseDto = CountryResponseDto;
//# sourceMappingURL=country.dto.js.map