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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const client_1 = require("@prisma/client");
let NotificationService = class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ];
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
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } },
                        ],
                    },
                }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                notifications: notifications.map(notification => ({
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
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
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
            const [total, unread, byType, recentNotifications, averageReadTime,] = await Promise.all([
                this.prisma.notification.count({
                    where: { userId },
                }),
                this.prisma.notification.count({
                    where: {
                        userId,
                        isRead: false,
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } },
                        ],
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
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map