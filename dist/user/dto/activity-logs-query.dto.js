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
exports.ActivityLogsQueryDto = exports.LogLevel = exports.LogAction = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var LogAction;
(function (LogAction) {
    LogAction["CREATE"] = "CREATE";
    LogAction["UPDATE"] = "UPDATE";
    LogAction["DELETE"] = "DELETE";
    LogAction["LOGIN"] = "LOGIN";
    LogAction["LOGOUT"] = "LOGOUT";
    LogAction["REGISTER"] = "REGISTER";
    LogAction["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    LogAction["PROFILE_UPDATE"] = "PROFILE_UPDATE";
    LogAction["EMAIL_VERIFY"] = "EMAIL_VERIFY";
    LogAction["PHONE_VERIFY"] = "PHONE_VERIFY";
    LogAction["JOB_APPLY"] = "JOB_APPLY";
    LogAction["JOB_CREATE"] = "JOB_CREATE";
    LogAction["JOB_UPDATE"] = "JOB_UPDATE";
    LogAction["JOB_DELETE"] = "JOB_DELETE";
    LogAction["COMPANY_CREATE"] = "COMPANY_CREATE";
    LogAction["COMPANY_UPDATE"] = "COMPANY_UPDATE";
    LogAction["COMPANY_DELETE"] = "COMPANY_DELETE";
    LogAction["ADMIN_ACTION"] = "ADMIN_ACTION";
    LogAction["SYSTEM_ACTION"] = "SYSTEM_ACTION";
})(LogAction || (exports.LogAction = LogAction = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class ActivityLogsQueryDto {
    action;
    level;
    entity;
    startDate;
    endDate;
    page = 1;
    limit = 10;
}
exports.ActivityLogsQueryDto = ActivityLogsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Object.values(LogAction), { message: 'Invalid action filter' }),
    __metadata("design:type", String)
], ActivityLogsQueryDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Object.values(LogLevel), { message: 'Invalid level filter' }),
    __metadata("design:type", String)
], ActivityLogsQueryDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Entity must be a string' }),
    __metadata("design:type", String)
], ActivityLogsQueryDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Start date must be a valid date' }),
    __metadata("design:type", String)
], ActivityLogsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'End date must be a valid date' }),
    __metadata("design:type", String)
], ActivityLogsQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    __metadata("design:type", Number)
], ActivityLogsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(100, { message: 'Limit must not exceed 100' }),
    __metadata("design:type", Number)
], ActivityLogsQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=activity-logs-query.dto.js.map