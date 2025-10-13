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
exports.NotificationStatsResponseDto = exports.CreateNotificationDto = exports.MarkAllAsReadResponseDto = exports.MarkAsReadResponseDto = exports.UnreadCountResponseDto = exports.NotificationsListResponseDto = exports.NotificationResponseDto = exports.NotificationQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class NotificationQueryDto {
    search;
    type;
    isRead;
    sortBy;
    sortOrder;
    page;
    limit;
}
exports.NotificationQueryDto = NotificationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search must be a string' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.NotificationType, { message: 'Invalid notification type' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Is read must be a boolean' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    __metadata("design:type", Boolean)
], NotificationQueryDto.prototype, "isRead", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort by must be a string' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort order must be a string' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Page must be a string' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Limit must be a string' }),
    __metadata("design:type", String)
], NotificationQueryDto.prototype, "limit", void 0);
class NotificationResponseDto {
    id;
    userId;
    type;
    title;
    message;
    data;
    isRead;
    readAt;
    expiresAt;
    createdAt;
}
exports.NotificationResponseDto = NotificationResponseDto;
class NotificationsListResponseDto {
    notifications;
    total;
    page;
    limit;
    totalPages;
    hasNext;
    hasPrev;
    unreadCount;
}
exports.NotificationsListResponseDto = NotificationsListResponseDto;
class UnreadCountResponseDto {
    unreadCount;
}
exports.UnreadCountResponseDto = UnreadCountResponseDto;
class MarkAsReadResponseDto {
    success;
    message;
}
exports.MarkAsReadResponseDto = MarkAsReadResponseDto;
class MarkAllAsReadResponseDto {
    success;
    message;
    updatedCount;
}
exports.MarkAllAsReadResponseDto = MarkAllAsReadResponseDto;
class CreateNotificationDto {
    userId;
    type;
    title;
    message;
    data;
    expiresAt;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'User ID must be a string' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.NotificationType, { message: 'Invalid notification type' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Message must be a string' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Expires at must be a valid date' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "expiresAt", void 0);
class NotificationStatsResponseDto {
    total;
    unread;
    byType;
    recentNotifications;
    averageReadTime;
}
exports.NotificationStatsResponseDto = NotificationStatsResponseDto;
//# sourceMappingURL=notification.dto.js.map