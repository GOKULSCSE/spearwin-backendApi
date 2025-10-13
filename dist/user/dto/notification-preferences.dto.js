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
exports.UpdateNotificationPreferencesDto = exports.NotificationPreferencesResponseDto = exports.NotificationPreferencesDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class NotificationPreferencesDto {
    type;
    email;
    push;
    sms;
    inApp;
}
exports.NotificationPreferencesDto = NotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.NotificationType),
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