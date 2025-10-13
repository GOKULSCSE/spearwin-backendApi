"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
const admin = __importStar(require("firebase-admin"));
let NotificationService = NotificationService_1 = class NotificationService {
    logger = new common_1.Logger(NotificationService_1.name);
    firebaseApp;
    prisma;
    constructor(databaseService) {
        this.prisma = databaseService;
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            if (admin.apps.length === 0) {
                if (!process.env.FIREBASE_PROJECT_ID ||
                    !process.env.FIREBASE_PRIVATE_KEY ||
                    !process.env.FIREBASE_CLIENT_EMAIL) {
                    this.logger.warn('Firebase environment variables not set. FCM features will be disabled.');
                    return;
                }
                const serviceAccount = {
                    type: 'service_account',
                    project_id: process.env.FIREBASE_PROJECT_ID,
                    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
                    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    client_email: process.env.FIREBASE_CLIENT_EMAIL,
                    client_id: process.env.FIREBASE_CLIENT_ID || '',
                    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                    token_uri: 'https://oauth2.googleapis.com/token',
                    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
                };
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: process.env.FIREBASE_PROJECT_ID,
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
            else {
                this.firebaseApp = admin.app();
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
            this.logger.warn('FCM features will be disabled due to initialization failure');
        }
    }
    async getUserNotifications(userId, query) {
        try {
            const page = parseInt(query.page || '1');
            const limit = parseInt(query.limit || '10');
            const skip = (page - 1) * limit;
            const where = {
                userId,
            };
            if (query.type) {
                where.type = query.type;
            }
            if (query.isRead !== undefined) {
                where.isRead = query.isRead;
            }
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { message: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
            const orderBy = {};
            if (query.sortBy) {
                orderBy[query.sortBy] = query.sortOrder || 'desc';
            }
            else {
                orderBy.createdAt = 'desc';
            }
            const [notifications, total, unreadCount] = await Promise.all([
                this.prisma.notification.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.notification.count({ where }),
                this.prisma.notification.count({
                    where: {
                        userId,
                        isRead: false,
                        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                    },
                }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                notifications: notifications.map((notification) => ({
                    id: notification.id,
                    userId: notification.userId,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    isRead: notification.isRead,
                    readAt: notification.readAt || undefined,
                    expiresAt: notification.expiresAt || undefined,
                    createdAt: notification.createdAt,
                })),
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                unreadCount,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch notifications');
        }
    }
    async getNotificationById(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.findFirst({
                where: {
                    id: notificationId,
                    userId,
                },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            return {
                id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                readAt: notification.readAt || undefined,
                expiresAt: notification.expiresAt || undefined,
                createdAt: notification.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch notification');
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.findFirst({
                where: {
                    id: notificationId,
                    userId,
                },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            if (notification.isRead) {
                return {
                    success: true,
                    message: 'Notification is already marked as read',
                };
            }
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Notification', notificationId, 'Notification marked as read');
            return {
                success: true,
                message: 'Notification marked as read successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to mark notification as read');
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await this.prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            await this.logActivity(userId, client_1.LogAction.UPDATE, client_1.LogLevel.INFO, 'Notification', null, `Marked ${result.count} notifications as read`);
            return {
                success: true,
                message: 'All notifications marked as read successfully',
                updatedCount: result.count,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to mark all notifications as read');
        }
    }
    async getUnreadCount(userId) {
        try {
            const unreadCount = await this.prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
            });
            return {
                unreadCount,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch unread count');
        }
    }
    async createNotification(createDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: createDto.userId,
                    type: createDto.type,
                    title: createDto.title,
                    message: createDto.message,
                    data: createDto.data,
                    expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
                },
            });
            return {
                id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                readAt: notification.readAt || undefined,
                expiresAt: notification.expiresAt || undefined,
                createdAt: notification.createdAt,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create notification');
        }
    }
    async getNotificationStats(userId) {
        try {
            const [total, unread, byType, recentNotifications, averageReadTime] = await Promise.all([
                this.prisma.notification.count({
                    where: { userId },
                }),
                this.prisma.notification.count({
                    where: {
                        userId,
                        isRead: false,
                        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                    },
                }),
                this.prisma.notification.groupBy({
                    by: ['type'],
                    where: { userId },
                    _count: true,
                }),
                this.prisma.notification.count({
                    where: {
                        userId,
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
                Promise.resolve({ _avg: { fileSize: 0 } }),
            ]);
            const typeStats = {
                JOB_ALERT: 0,
                APPLICATION_UPDATE: 0,
                SYSTEM_NOTIFICATION: 0,
                SECURITY_ALERT: 0,
                COMPANY_UPDATE: 0,
            };
            byType.forEach((item) => {
                const type = item.type;
                if (typeStats.hasOwnProperty(type)) {
                    typeStats[type] = item._count;
                }
            });
            return {
                total,
                unread,
                byType: typeStats,
                recentNotifications,
                averageReadTime: 0,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch notification statistics');
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.findFirst({
                where: {
                    id: notificationId,
                    userId,
                },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            await this.prisma.notification.delete({
                where: { id: notificationId },
            });
            await this.logActivity(userId, client_1.LogAction.DELETE, client_1.LogLevel.INFO, 'Notification', notificationId, 'Notification deleted');
            return {
                success: true,
                message: 'Notification deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete notification');
        }
    }
    async createNotificationWithPush(createDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: createDto.userId,
                    type: createDto.type,
                    title: createDto.title,
                    message: createDto.message,
                    data: createDto.data,
                    expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
                },
            });
            if (createDto.sendPush !== false) {
                try {
                    const payload = {
                        title: createDto.title,
                        body: createDto.message,
                        data: createDto.data,
                        imageUrl: createDto.imageUrl,
                        clickAction: createDto.clickAction,
                    };
                    if (createDto.userIds && createDto.userIds.length > 0) {
                        for (const userId of createDto.userIds) {
                            await this.sendToUser(userId, payload);
                        }
                    }
                    else {
                        await this.sendToUser(createDto.userId, payload);
                    }
                }
                catch (fcmError) {
                    console.error('FCM push notification failed:', fcmError);
                }
            }
            return {
                id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                readAt: notification.readAt || undefined,
                expiresAt: notification.expiresAt || undefined,
                createdAt: notification.createdAt,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create notification with push');
        }
    }
    async sendBulkNotifications(bulkDto) {
        const results = [];
        let successfulNotifications = 0;
        let failedNotifications = 0;
        for (const notificationDto of bulkDto.notifications) {
            try {
                const result = await this.createNotificationWithPush(notificationDto);
                results.push({
                    userId: notificationDto.userId,
                    success: true,
                    notificationId: result.id,
                });
                successfulNotifications++;
            }
            catch (error) {
                results.push({
                    userId: notificationDto.userId,
                    success: false,
                    message: error.message || 'Failed to create notification',
                });
                failedNotifications++;
            }
        }
        return {
            success: failedNotifications === 0,
            message: `Processed ${bulkDto.notifications.length} notifications. ${successfulNotifications} successful, ${failedNotifications} failed.`,
            totalNotifications: bulkDto.notifications.length,
            successfulNotifications,
            failedNotifications,
            results,
        };
    }
    async sendNotificationToTopic(topic, title, message, data, options) {
        try {
            const payload = {
                title,
                body: message,
                data,
                imageUrl: options?.imageUrl,
                clickAction: options?.clickAction,
            };
            await this.sendToTopic(topic, payload);
            return {
                success: true,
                message: 'Topic notification sent successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to send topic notification');
        }
    }
    async sendNotificationToCondition(condition, title, message, data, options) {
        try {
            const payload = {
                title,
                body: message,
                data,
                imageUrl: options?.imageUrl,
                clickAction: options?.clickAction,
            };
            throw new common_1.BadRequestException('Condition-based notifications not yet implemented');
            return {
                success: true,
                message: 'Condition notification sent successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to send condition notification');
        }
    }
    async sendToDevice(token, payload) {
        if (!this.firebaseApp) {
            throw new common_1.BadRequestException('Firebase not initialized. Please check your environment variables.');
        }
        try {
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                token,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: payload.clickAction,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: payload.title,
                                body: payload.body,
                            },
                            badge: 1,
                            sound: 'default',
                            contentAvailable: true,
                            mutableContent: true,
                        },
                    },
                },
                webpush: {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        icon: '/assets/icon-192x192.png',
                        badge: '/assets/badge-72x72.png',
                        actions: [{ action: 'open', title: 'Open App' }],
                    },
                    fcmOptions: {
                        link: payload.clickAction || '/',
                    },
                },
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`FCM message sent successfully: ${response}`);
            return response;
        }
        catch (error) {
            this.logger.error('Failed to send FCM message:', error);
            throw new common_1.BadRequestException('Failed to send push notification');
        }
    }
    async sendToMultipleDevices(tokens, payload) {
        if (!this.firebaseApp) {
            throw new common_1.BadRequestException('Firebase not initialized. Please check your environment variables.');
        }
        try {
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                tokens,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: payload.clickAction,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: payload.title,
                                body: payload.body,
                            },
                            badge: 1,
                            sound: 'default',
                            contentAvailable: true,
                            mutableContent: true,
                        },
                    },
                },
                webpush: {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        icon: '/assets/icon-192x192.png',
                        badge: '/assets/badge-72x72.png',
                        actions: [{ action: 'open', title: 'Open App' }],
                    },
                    fcmOptions: {
                        link: payload.clickAction || '/',
                    },
                },
            };
            const response = await admin.messaging().sendMulticast(message);
            this.logger.log(`FCM multicast sent successfully. Success: ${response.successCount}, Failed: ${response.failureCount}`);
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                        this.logger.warn(`Failed to send to token ${tokens[idx]}: ${resp.error?.message}`);
                    }
                });
                if (failedTokens.length > 0) {
                    await this.removeInvalidTokens(failedTokens);
                }
            }
            return response;
        }
        catch (error) {
            this.logger.error('Failed to send FCM multicast:', error);
            throw new common_1.BadRequestException('Failed to send push notifications');
        }
    }
    async sendToTopic(topic, payload) {
        if (!this.firebaseApp) {
            throw new common_1.BadRequestException('Firebase not initialized. Please check your environment variables.');
        }
        try {
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data,
                topic,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: payload.clickAction,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: payload.title,
                                body: payload.body,
                            },
                            badge: 1,
                            sound: 'default',
                            contentAvailable: true,
                            mutableContent: true,
                        },
                    },
                },
                webpush: {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        icon: '/assets/icon-192x192.png',
                        badge: '/assets/badge-72x72.png',
                        actions: [{ action: 'open', title: 'Open App' }],
                    },
                    fcmOptions: {
                        link: payload.clickAction || '/',
                    },
                },
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`FCM topic message sent successfully: ${response}`);
            return response;
        }
        catch (error) {
            this.logger.error('Failed to send FCM topic message:', error);
            throw new common_1.BadRequestException('Failed to send topic notification');
        }
    }
    async sendToUser(userId, payload) {
        try {
            const deviceTokens = await this.getUserDeviceTokens(userId);
            if (deviceTokens.length === 0) {
                this.logger.warn(`No device tokens found for user ${userId}`);
                return {
                    successCount: 0,
                    failureCount: 0,
                    responses: [],
                };
            }
            return await this.sendToMultipleDevices(deviceTokens, payload);
        }
        catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
            throw new common_1.BadRequestException('Failed to send user notification');
        }
    }
    async getUserDeviceTokens(userId) {
        try {
            const tokens = await this.prisma.fCMToken.findMany({
                where: {
                    userId,
                    isActive: true,
                },
                select: {
                    token: true,
                },
            });
            return tokens.map((t) => t.token);
        }
        catch (error) {
            this.logger.error('Failed to get user device tokens:', error);
            return [];
        }
    }
    async registerDeviceToken(userId, token, deviceInfo) {
        try {
            const existingToken = await this.prisma.fCMToken.findFirst({
                where: {
                    token,
                    userId,
                },
            });
            if (existingToken) {
                await this.prisma.fCMToken.update({
                    where: { id: existingToken.id },
                    data: {
                        isActive: true,
                        lastUsed: new Date(),
                        deviceInfo,
                    },
                });
            }
            else {
                await this.prisma.fCMToken.create({
                    data: {
                        userId,
                        token,
                        isActive: true,
                        deviceInfo,
                        lastUsed: new Date(),
                    },
                });
            }
            this.logger.log(`Device token registered for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to register device token:', error);
            throw new common_1.BadRequestException('Failed to register device token');
        }
    }
    async unregisterDeviceToken(userId, token) {
        try {
            await this.prisma.fCMToken.updateMany({
                where: {
                    userId,
                    token,
                },
                data: {
                    isActive: false,
                },
            });
            this.logger.log(`Device token unregistered for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to unregister device token:', error);
            throw new common_1.BadRequestException('Failed to unregister device token');
        }
    }
    async removeInvalidTokens(tokens) {
        try {
            await this.prisma.fCMToken.updateMany({
                where: {
                    token: {
                        in: tokens,
                    },
                },
                data: {
                    isActive: false,
                },
            });
            this.logger.log(`Marked ${tokens.length} invalid tokens as inactive`);
        }
        catch (error) {
            this.logger.error('Failed to remove invalid tokens:', error);
        }
    }
    async validateToken(token) {
        try {
            await admin.messaging().send({
                token,
                data: { test: 'true' },
            }, true);
            return true;
        }
        catch (error) {
            this.logger.warn(`Invalid FCM token: ${token}`, error);
            return false;
        }
    }
    async subscribeToTopic(tokens, topic) {
        try {
            const response = await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${response.successCount} tokens to topic ${topic}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
            throw new common_1.BadRequestException('Failed to subscribe to topic');
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        try {
            const response = await admin
                .messaging()
                .unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${response.successCount} tokens from topic ${topic}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
            throw new common_1.BadRequestException('Failed to unsubscribe from topic');
        }
    }
    async getUserFCMTokens(userId) {
        try {
            return await this.getUserDeviceTokens(userId);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to get user FCM tokens');
        }
    }
    async registerFCMToken(userId, token, deviceInfo) {
        try {
            await this.registerDeviceToken(userId, token, deviceInfo);
            return {
                success: true,
                message: 'FCM token registered successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to register FCM token');
        }
    }
    async unregisterFCMToken(userId, token) {
        try {
            await this.unregisterDeviceToken(userId, token);
            return {
                success: true,
                message: 'FCM token unregistered successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to unregister FCM token');
        }
    }
    async validateFCMToken(token) {
        try {
            const isValid = await this.validateToken(token);
            return {
                isValid,
                message: isValid ? 'Token is valid' : 'Token is invalid',
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: 'Failed to validate token',
            };
        }
    }
    async logActivity(userId, action, level, entity, entityId, description, metadata, ipAddress, userAgent) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    userId,
                    action,
                    level,
                    entity,
                    entityId,
                    description,
                    metadata,
                    ipAddress,
                    userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map