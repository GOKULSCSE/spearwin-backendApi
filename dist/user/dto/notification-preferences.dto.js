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
exports.UpdateNotificationPreferencesDto = exports.NotificationPreferencesResponseDto = exports.NotificationPreferencesDto = exports.NotificationType = void 0;
const class_validator_1 = require("class-validator");
var NotificationType;
(function (NotificationType) {
    NotificationType["JOB_ALERT"] = "JOB_ALERT";
    NotificationType["APPLICATION_UPDATE"] = "APPLICATION_UPDATE";
    NotificationType["PROFILE_UPDATE"] = "PROFILE_UPDATE";
    NotificationType["SYSTEM_NOTIFICATION"] = "SYSTEM_NOTIFICATION";
    NotificationType["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotificationType["COMPANY_UPDATE"] = "COMPANY_UPDATE";
    NotificationType["NEW_MESSAGE"] = "NEW_MESSAGE";
    NotificationType["INTERVIEW_SCHEDULED"] = "INTERVIEW_SCHEDULED";
    NotificationType["JOB_RECOMMENDATION"] = "JOB_RECOMMENDATION";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class NotificationPreferencesDto {
    type;
    email;
    push;
    sms;
    inApp;
}
exports.NotificationPreferencesDto = NotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsEnum)(NotificationType),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationPreferencesDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "push", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "sms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "inApp", void 0);
class NotificationPreferencesResponseDto {
    preferences;
    updatedAt;
}
exports.NotificationPreferencesResponseDto = NotificationPreferencesResponseDto;
class UpdateNotificationPreferencesDto {
    preferences;
}
exports.UpdateNotificationPreferencesDto = UpdateNotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateNotificationPreferencesDto.prototype, "preferences", void 0);
//# sourceMappingURL=notification-preferences.dto.js.map