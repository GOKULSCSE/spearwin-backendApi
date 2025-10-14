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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const notification_dto_1 = require("./dto/notification.dto");
const fcm_dto_1 = require("./dto/fcm.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getUserNotifications(query, user) {
        return this.notificationService.getUserNotifications(user.id, query);
    }
    async getNotificationById(notificationId, user) {
        return this.notificationService.getNotificationById(notificationId, user.id);
    }
    async markAsRead(notificationId, user) {
        return this.notificationService.markAsRead(notificationId, user.id);
    }
    async markAllAsRead(user) {
        return this.notificationService.markAllAsRead(user.id);
    }
    async getUnreadCount(user) {
        return this.notificationService.getUnreadCount(user.id);
    }
    async getNotificationStats(user) {
        return this.notificationService.getNotificationStats(user.id);
    }
    async deleteNotification(notificationId, user) {
        return this.notificationService.deleteNotification(notificationId, user.id);
    }
    async createNotification(createDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can create notifications');
        }
        return this.notificationService.createNotification(createDto);
    }
    async createNotificationWithPush(createDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can create notifications');
        }
        return this.notificationService.createNotificationWithPush(createDto);
    }
    async sendBulkNotifications(bulkDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send bulk notifications');
        }
        return this.notificationService.sendBulkNotifications(bulkDto);
    }
    async registerFCMToken(registerDto, user) {
        return this.notificationService.registerFCMToken(user.id, registerDto.token, registerDto.deviceInfo);
    }
    async unregisterFCMToken(unregisterDto, user) {
        return this.notificationService.unregisterFCMToken(user.id, unregisterDto.token);
    }
    async getUserFCMTokens(user) {
        return this.notificationService.getUserFCMTokens(user.id);
    }
    async validateFCMToken(validateDto) {
        return this.notificationService.validateFCMToken(validateDto.token);
    }
    async sendToUser(sendDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send push notifications');
        }
        try {
            const response = await this.notificationService.sendToUser(sendDto.userId, {
                title: sendDto.title,
                body: sendDto.body,
                data: sendDto.data,
                imageUrl: sendDto.imageUrl,
                clickAction: sendDto.clickAction,
            });
            return {
                success: true,
                message: 'Push notification sent successfully',
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send push notification',
            };
        }
    }
    async sendToMultipleUsers(sendDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send push notifications');
        }
        try {
            let totalSuccess = 0;
            let totalFailure = 0;
            const failedUsers = [];
            for (const userId of sendDto.userIds) {
                try {
                    const response = await this.notificationService.sendToUser(userId, {
                        title: sendDto.title,
                        body: sendDto.body,
                        data: sendDto.data,
                        imageUrl: sendDto.imageUrl,
                        clickAction: sendDto.clickAction,
                    });
                    totalSuccess += response.successCount;
                    totalFailure += response.failureCount;
                }
                catch (error) {
                    totalFailure++;
                    failedUsers.push(userId);
                }
            }
            return {
                success: totalFailure === 0,
                message: `Push notifications sent. ${totalSuccess} successful, ${totalFailure} failed.`,
                successCount: totalSuccess,
                failureCount: totalFailure,
                failedTokens: failedUsers,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send push notifications',
            };
        }
    }
    async sendToToken(sendDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send push notifications');
        }
        try {
            const messageId = await this.notificationService.sendToDevice(sendDto.token, {
                title: sendDto.title,
                body: sendDto.body,
                data: sendDto.data,
                imageUrl: sendDto.imageUrl,
                clickAction: sendDto.clickAction,
            });
            return {
                success: true,
                message: 'Push notification sent successfully',
                messageId,
                successCount: 1,
                failureCount: 0,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send push notification',
                successCount: 0,
                failureCount: 1,
            };
        }
    }
    async sendToMultipleTokens(sendDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send push notifications');
        }
        try {
            const response = await this.notificationService.sendToMultipleDevices(sendDto.tokens, {
                title: sendDto.title,
                body: sendDto.body,
                data: sendDto.data,
                imageUrl: sendDto.imageUrl,
                clickAction: sendDto.clickAction,
            });
            return {
                success: response.failureCount === 0,
                message: `Push notifications sent. ${response.successCount} successful, ${response.failureCount} failed.`,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send push notifications',
            };
        }
    }
    async sendToTopic(sendDto, user) {
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only admins can send push notifications');
        }
        try {
            const messageId = await this.notificationService.sendToTopic(sendDto.topic, {
                title: sendDto.title,
                body: sendDto.body,
                data: sendDto.data,
                imageUrl: sendDto.imageUrl,
                clickAction: sendDto.clickAction,
            });
            return {
                success: true,
                message: 'Topic notification sent successfully',
                messageId,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send topic notification',
            };
        }
    }
    async subscribeToTopic(subscribeDto, user) {
        try {
            const response = await this.notificationService.subscribeToTopic(subscribeDto.tokens, subscribeDto.topic);
            return {
                success: response.failureCount === 0,
                message: `Topic subscription processed. ${response.successCount} successful, ${response.failureCount} failed.`,
                successCount: response.successCount,
                failureCount: response.failureCount,
                errors: response.errors,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to subscribe to topic',
                successCount: 0,
                failureCount: subscribeDto.tokens.length,
            };
        }
    }
    async unsubscribeFromTopic(unsubscribeDto, user) {
        try {
            const response = await this.notificationService.unsubscribeFromTopic(unsubscribeDto.tokens, unsubscribeDto.topic);
            return {
                success: response.failureCount === 0,
                message: `Topic unsubscription processed. ${response.successCount} successful, ${response.failureCount} failed.`,
                successCount: response.successCount,
                failureCount: response.failureCount,
                errors: response.errors,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to unsubscribe from topic',
                successCount: 0,
                failureCount: unsubscribeDto.tokens.length,
            };
        }
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.NotificationQueryDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationById", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('mark-all-read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.CreateNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Post)('with-push'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.CreateNotificationWithPushDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotificationWithPush", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.BulkNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendBulkNotifications", null);
__decorate([
    (0, common_1.Post)('fcm/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.RegisterFCMTokenDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "registerFCMToken", null);
__decorate([
    (0, common_1.Post)('fcm/unregister'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.UnregisterFCMTokenDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "unregisterFCMToken", null);
__decorate([
    (0, common_1.Get)('fcm/tokens'),
    __param(0, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserFCMTokens", null);
__decorate([
    (0, common_1.Post)('fcm/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.ValidateTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "validateFCMToken", null);
__decorate([
    (0, common_1.Post)('fcm/send-to-user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SendToUserNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToUser", null);
__decorate([
    (0, common_1.Post)('fcm/send-to-multiple-users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SendToMultipleUsersNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToMultipleUsers", null);
__decorate([
    (0, common_1.Post)('fcm/send-to-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SendToTokenNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToToken", null);
__decorate([
    (0, common_1.Post)('fcm/send-to-multiple-tokens'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SendToMultipleTokensNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToMultipleTokens", null);
__decorate([
    (0, common_1.Post)('fcm/send-to-topic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SendToTopicNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToTopic", null);
__decorate([
    (0, common_1.Post)('fcm/subscribe-to-topic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.SubscribeToTopicDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "subscribeToTopic", null);
__decorate([
    (0, common_1.Post)('fcm/unsubscribe-from-topic'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.GetCurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fcm_dto_1.UnsubscribeFromTopicDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "unsubscribeFromTopic", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('api/notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map