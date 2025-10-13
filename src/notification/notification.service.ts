import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { 
  NotificationQueryDto, 
  NotificationResponseDto, 
  NotificationsListResponseDto, 
  UnreadCountResponseDto,
  MarkAsReadResponseDto,
  MarkAllAsReadResponseDto,
  CreateNotificationDto,
  NotificationStatsResponseDto
} from './dto/notification.dto';
import { NotificationType, LogAction, LogLevel } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: DatabaseService) {}

  async getUserNotifications(
    userId: string, 
    query: NotificationQueryDto
  ): Promise<NotificationsListResponseDto> {
    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
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

      // Filter out expired notifications
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];

      // Build order by
      const orderBy: any = {};
      if (query.sortBy) {
        orderBy[query.sortBy] = query.sortOrder || 'desc';
      } else {
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch notifications');
    }
  }

  async getNotificationById(notificationId: string, userId: string): Promise<NotificationResponseDto> {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch notification');
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<MarkAsReadResponseDto> {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
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

      // Log the activity
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Notification',
        notificationId,
        'Notification marked as read'
      );

      return {
        success: true,
        message: 'Notification marked as read successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<MarkAllAsReadResponseDto> {
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

      // Log the activity
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'Notification',
        null,
        `Marked ${result.count} notifications as read`
      );

      return {
        success: true,
        message: 'All notifications marked as read successfully',
        updatedCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('Failed to mark all notifications as read');
    }
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch unread count');
    }
  }

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
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
    } catch (error) {
      throw new BadRequestException('Failed to create notification');
    }
  }

  async getNotificationStats(userId: string): Promise<NotificationStatsResponseDto> {
    try {
      const [
        total,
        unread,
        byType,
        recentNotifications,
        averageReadTime,
      ] = await Promise.all([
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
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
        // Note: This is a simplified calculation
        // In reality, you'd need to calculate the difference between createdAt and readAt
        Promise.resolve({ _avg: { fileSize: 0 } }),
      ]);

      // Process type statistics
      const typeStats = {
        JOB_ALERT: 0,
        APPLICATION_UPDATE: 0,
        SYSTEM_NOTIFICATION: 0,
        SECURITY_ALERT: 0,
        COMPANY_UPDATE: 0,
      };

      byType.forEach((item) => {
        const type = item.type as keyof typeof typeStats;
        if (typeStats.hasOwnProperty(type)) {
          typeStats[type] = item._count;
        }
      });

      return {
        total,
        unread,
        byType: typeStats,
        recentNotifications,
        averageReadTime: 0, // This would need more complex calculation
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch notification statistics');
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.prisma.notification.delete({
        where: { id: notificationId },
      });

      // Log the activity
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.INFO,
        'Notification',
        notificationId,
        'Notification deleted'
      );

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete notification');
    }
  }

  private async logActivity(
    userId: string,
    action: LogAction,
    level: LogLevel,
    entity: string,
    entityId: string | null,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }
}
