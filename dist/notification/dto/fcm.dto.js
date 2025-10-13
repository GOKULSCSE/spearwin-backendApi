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
exports.BulkNotificationResponseDto = exports.BulkNotificationDto = exports.CreateNotificationWithPushDto = exports.ValidateTokenResponseDto = exports.ValidateTokenDto = exports.FCMTopicResponseDto = exports.FCMResponseDto = exports.UnsubscribeFromTopicDto = exports.SubscribeToTopicDto = exports.SendToConditionNotificationDto = exports.SendToTopicNotificationDto = exports.SendToMultipleTokensNotificationDto = exports.SendToTokenNotificationDto = exports.SendToMultipleUsersNotificationDto = exports.SendToUserNotificationDto = exports.SendPushNotificationDto = exports.FCMTokensListResponseDto = exports.FCMTokenResponseDto = exports.UnregisterFCMTokenDto = exports.RegisterFCMTokenDto = void 0;
const class_validator_1 = require("class-validator");
class RegisterFCMTokenDto {
    token;
    deviceInfo;
}
exports.RegisterFCMTokenDto = RegisterFCMTokenDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    __metadata("design:type", String)
], RegisterFCMTokenDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'info must be an object' }),
    __metadata("design:type", Object)
], RegisterFCMTokenDto.prototype, "deviceInfo", void 0);
class UnregisterFCMTokenDto {
    token;
}
exports.UnregisterFCMTokenDto = UnregisterFCMTokenDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    __metadata("design:type", String)
], UnregisterFCMTokenDto.prototype, "token", void 0);
class FCMTokenResponseDto {
    id;
    userId;
    token;
    isActive;
    deviceInfo;
    lastUsed;
    createdAt;
    updatedAt;
}
exports.FCMTokenResponseDto = FCMTokenResponseDto;
class FCMTokensListResponseDto {
    tokens;
    total;
    activeCount;
    inactiveCount;
}
exports.FCMTokensListResponseDto = FCMTokensListResponseDto;
class SendPushNotificationDto {
    title;
    body;
    data;
    imageUrl;
    clickAction;
}
exports.SendPushNotificationDto = SendPushNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    __metadata("design:type", String)
], SendPushNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Body must be a string' }),
    __metadata("design:type", String)
], SendPushNotificationDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Data must be an object' }),
    __metadata("design:type", Object)
], SendPushNotificationDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Image URL must be a string' }),
    __metadata("design:type", String)
], SendPushNotificationDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Click action must be a string' }),
    __metadata("design:type", String)
], SendPushNotificationDto.prototype, "clickAction", void 0);
class SendToUserNotificationDto extends SendPushNotificationDto {
    userId;
}
exports.SendToUserNotificationDto = SendToUserNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'User ID must be a string' }),
    __metadata("design:type", String)
], SendToUserNotificationDto.prototype, "userId", void 0);
class SendToMultipleUsersNotificationDto extends SendPushNotificationDto {
    userIds;
}
exports.SendToMultipleUsersNotificationDto = SendToMultipleUsersNotificationDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'User IDs must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each user ID must be a string' }),
    __metadata("design:type", Array)
], SendToMultipleUsersNotificationDto.prototype, "userIds", void 0);
class SendToTokenNotificationDto extends SendPushNotificationDto {
    token;
}
exports.SendToTokenNotificationDto = SendToTokenNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    __metadata("design:type", String)
], SendToTokenNotificationDto.prototype, "token", void 0);
class SendToMultipleTokensNotificationDto extends SendPushNotificationDto {
    tokens;
}
exports.SendToMultipleTokensNotificationDto = SendToMultipleTokensNotificationDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Tokens must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each token must be a string' }),
    __metadata("design:type", Array)
], SendToMultipleTokensNotificationDto.prototype, "tokens", void 0);
class SendToTopicNotificationDto extends SendPushNotificationDto {
    topic;
}
exports.SendToTopicNotificationDto = SendToTopicNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Topic must be a string' }),
    __metadata("design:type", String)
], SendToTopicNotificationDto.prototype, "topic", void 0);
class SendToConditionNotificationDto extends SendPushNotificationDto {
    condition;
}
exports.SendToConditionNotificationDto = SendToConditionNotificationDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Condition must be a string' }),
    __metadata("design:type", String)
], SendToConditionNotificationDto.prototype, "condition", void 0);
class SubscribeToTopicDto {
    tokens;
    topic;
}
exports.SubscribeToTopicDto = SubscribeToTopicDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Tokens must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each token must be a string' }),
    __metadata("design:type", Array)
], SubscribeToTopicDto.prototype, "tokens", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Topic must be a string' }),
    __metadata("design:type", String)
], SubscribeToTopicDto.prototype, "topic", void 0);
class UnsubscribeFromTopicDto {
    tokens;
    topic;
}
exports.UnsubscribeFromTopicDto = UnsubscribeFromTopicDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Tokens must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each token must be a string' }),
    __metadata("design:type", Array)
], UnsubscribeFromTopicDto.prototype, "tokens", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Topic must be a string' }),
    __metadata("design:type", String)
], UnsubscribeFromTopicDto.prototype, "topic", void 0);
class FCMResponseDto {
    success;
    message;
    messageId;
    successCount;
    failureCount;
    failedTokens;
}
exports.FCMResponseDto = FCMResponseDto;
class FCMTopicResponseDto {
    success;
    message;
    successCount;
    failureCount;
    errors;
}
exports.FCMTopicResponseDto = FCMTopicResponseDto;
class ValidateTokenDto {
    token;
}
exports.ValidateTokenDto = ValidateTokenDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    __metadata("design:type", String)
], ValidateTokenDto.prototype, "token", void 0);
class ValidateTokenResponseDto {
    isValid;
    message;
}
exports.ValidateTokenResponseDto = ValidateTokenResponseDto;
class CreateNotificationWithPushDto {
    userId;
    userIds;
    title;
    message;
    data;
    imageUrl;
    clickAction;
    expiresAt;
    sendPush;
    topic;
    condition;
}
exports.CreateNotificationWithPushDto = CreateNotificationWithPushDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'User ID must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'User IDs must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each user ID must be a string' }),
    __metadata("design:type", Array)
], CreateNotificationWithPushDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Message must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)({ message: 'Data must be an object' }),
    __metadata("design:type", Object)
], CreateNotificationWithPushDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Image URL must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Click action must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "clickAction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Expires at must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Send push must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateNotificationWithPushDto.prototype, "sendPush", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Topic must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Condition must be a string' }),
    __metadata("design:type", String)
], CreateNotificationWithPushDto.prototype, "condition", void 0);
class BulkNotificationDto {
    notifications;
}
exports.BulkNotificationDto = BulkNotificationDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Notifications must be an array' }),
    __metadata("design:type", Array)
], BulkNotificationDto.prototype, "notifications", void 0);
class BulkNotificationResponseDto {
    success;
    message;
    totalNotifications;
    successfulNotifications;
    failedNotifications;
    results;
}
exports.BulkNotificationResponseDto = BulkNotificationResponseDto;
//# sourceMappingURL=fcm.dto.js.map