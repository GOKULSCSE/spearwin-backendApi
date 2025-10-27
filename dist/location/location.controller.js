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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const location_service_1 = require("./location.service");
const country_dto_1 = require("./dto/country.dto");
const state_dto_1 = require("./dto/state.dto");
const city_dto_1 = require("./dto/city.dto");
const pincode_dto_1 = require("./dto/pincode.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_role_guard_1 = require("../company/guards/admin-role.guard");
const super_admin_role_guard_1 = require("../company/guards/super-admin-role.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let LocationController = class LocationController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    async getAllCountries() {
        return this.locationService.getAllCountries();
    }
    async getCountryById(countryId) {
        return this.locationService.getCountryById(countryId);
    }
    async createCountry(user, createDto) {
        return this.locationService.createCountry(createDto, user.id);
    }
    async updateCountry(countryId, user, updateDto) {
        return this.locationService.updateCountry(countryId, updateDto, user.id);
    }
    async deleteCountry(countryId, user) {
        return this.locationService.deleteCountry(countryId, user.id);
    }
    async getAllStates(query) {
        return this.locationService.getAllStates(query);
    }
    async getStatesByCountry(countryId) {
        return this.locationService.getStatesByCountry(countryId);
    }
    async getStateById(stateId) {
        return this.locationService.getStateById(stateId);
    }
    async createState(user, createDto) {
        return this.locationService.createState(createDto, user.id);
    }
    async updateState(stateId, user, updateDto) {
        return this.locationService.updateState(stateId, updateDto, user.id);
    }
    async deleteState(stateId, user) {
        return this.locationService.deleteState(stateId, user.id);
    }
    async getAllCities(query) {
        return this.locationService.getAllCities(query);
    }
    async getCitiesByState(stateId) {
        return this.locationService.getCitiesByState(stateId);
    }
    async getCityById(cityId) {
        return this.locationService.getCityById(cityId);
    }
    async createCity(user, createDto) {
        return this.locationService.createCity(createDto, user.id);
    }
    async updateCity(cityId, user, updateDto) {
        return this.locationService.updateCity(cityId, updateDto, user.id);
    }
    async deleteCity(cityId, user) {
        return this.locationService.deleteCity(cityId, user.id);
    }
    async searchCities(query) {
        return this.locationService.searchCities(query);
    }
    async getPincodesByCity(cityId) {
        return this.locationService.getPincodesByCity(cityId);
    }
    async getPincodeById(pincodeId) {
        return this.locationService.getPincodeById(pincodeId);
    }
    async createPincode(user, createDto) {
        return this.locationService.createPincode(createDto, user.id);
    }
    async updatePincode(pincodeId, user, updateDto) {
        return this.locationService.updatePincode(pincodeId, updateDto, user.id);
    }
    async deletePincode(pincodeId, user) {
        return this.locationService.deletePincode(pincodeId, user.id);
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Get)('countries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getAllCountries", null);
__decorate([
    (0, common_1.Get)('countries/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getCountryById", null);
__decorate([
    (0, common_1.Post)('countries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, country_dto_1.CreateCountryDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createCountry", null);
__decorate([
    (0, common_1.Put)('countries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, country_dto_1.UpdateCountryDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateCountry", null);
__decorate([
    (0, common_1.Delete)('countries/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_role_guard_1.SuperAdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "deleteCountry", null);
__decorate([
    (0, common_1.Get)('states'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [state_dto_1.StateListQueryDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getAllStates", null);
__decorate([
    (0, common_1.Get)('countries/:countryId/states'),
    __param(0, (0, common_1.Param)('countryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getStatesByCountry", null);
__decorate([
    (0, common_1.Get)('states/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getStateById", null);
__decorate([
    (0, common_1.Post)('states'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, state_dto_1.CreateStateDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createState", null);
__decorate([
    (0, common_1.Put)('states/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, state_dto_1.UpdateStateDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateState", null);
__decorate([
    (0, common_1.Delete)('states/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_role_guard_1.SuperAdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "deleteState", null);
__decorate([
    (0, common_1.Get)('cities'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [city_dto_1.CityListQueryDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getAllCities", null);
__decorate([
    (0, common_1.Get)('states/:stateId/cities'),
    __param(0, (0, common_1.Param)('stateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getCitiesByState", null);
__decorate([
    (0, common_1.Get)('cities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getCityById", null);
__decorate([
    (0, common_1.Post)('cities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, city_dto_1.CreateCityDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createCity", null);
__decorate([
    (0, common_1.Put)('cities/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, city_dto_1.UpdateCityDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateCity", null);
__decorate([
    (0, common_1.Delete)('cities/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_role_guard_1.SuperAdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "deleteCity", null);
__decorate([
    (0, common_1.Get)('cities/search'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [city_dto_1.CitySearchQueryDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "searchCities", null);
__decorate([
    (0, common_1.Get)('cities/:cityId/pincodes'),
    __param(0, (0, common_1.Param)('cityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getPincodesByCity", null);
__decorate([
    (0, common_1.Get)('pincodes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getPincodeById", null);
__decorate([
    (0, common_1.Post)('pincodes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pincode_dto_1.CreatePincodeDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createPincode", null);
__decorate([
    (0, common_1.Put)('pincodes/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, pincode_dto_1.UpdatePincodeDto]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updatePincode", null);
__decorate([
    (0, common_1.Delete)('pincodes/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_role_guard_1.SuperAdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "deletePincode", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [location_service_1.LocationService])
], LocationController);
//# sourceMappingURL=location.controller.js.map