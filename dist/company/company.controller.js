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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const company_service_1 = require("./company.service");
const create_company_dto_1 = require("./dto/create-company.dto");
const update_company_dto_1 = require("./dto/update-company.dto");
const company_query_dto_1 = require("./dto/company-query.dto");
const verify_company_dto_1 = require("./dto/verify-company.dto");
const update_company_status_dto_1 = require("./dto/update-company-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_role_guard_1 = require("./guards/admin-role.guard");
const super_admin_role_guard_1 = require("./guards/super-admin-role.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let CompanyController = class CompanyController {
    companyService;
    constructor(companyService) {
        this.companyService = companyService;
    }
    async getAllCompanies(query) {
        return this.companyService.getAllCompanies(query);
    }
    async getActiveCompanies(sortBy, sortOrder) {
        return this.companyService.getActiveCompanies(sortBy, sortOrder);
    }
    async getInactiveCompanies(sortBy, sortOrder) {
        return this.companyService.getInactiveCompanies(sortBy, sortOrder);
    }
    async getCompanyById(companyId) {
        return this.companyService.getCompanyById(companyId);
    }
    async createCompany(user, createDto) {
        return this.companyService.createCompany(createDto, user.id);
    }
    async updateCompany(companyId, user, updateDto) {
        return this.companyService.updateCompany(companyId, updateDto, user.id);
    }
    async deleteCompany(companyId, user) {
        return this.companyService.deleteCompany(companyId, user.id);
    }
    async verifyCompany(companyId, user, verifyDto) {
        return this.companyService.verifyCompany(companyId, verifyDto, user.id);
    }
    async updateCompanyStatus(companyId, user, statusDto) {
        return this.companyService.updateCompanyStatus(companyId, statusDto, user.id);
    }
    async getCompanyJobs(companyId, page, limit) {
        return this.companyService.getCompanyJobs(companyId, page, limit);
    }
    async getCompanyStats(companyId) {
        return this.companyService.getCompanyStats(companyId);
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_query_dto_1.CompanyQueryDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getAllCompanies", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('sortBy')),
    __param(1, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getActiveCompanies", null);
__decorate([
    (0, common_1.Get)('inactive'),
    __param(0, (0, common_1.Query)('sortBy')),
    __param(1, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getInactiveCompanies", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_company_dto_1.CreateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(super_admin_role_guard_1.SuperAdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "deleteCompany", null);
__decorate([
    (0, common_1.Put)(':id/verify'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, verify_company_dto_1.VerifyCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "verifyCompany", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_company_status_dto_1.UpdateCompanyStatusDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "updateCompanyStatus", null);
__decorate([
    (0, common_1.Get)(':id/jobs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyJobs", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "getCompanyStats", null);
exports.CompanyController = CompanyController = __decorate([
    (0, common_1.Controller)('companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [company_service_1.CompanyService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map