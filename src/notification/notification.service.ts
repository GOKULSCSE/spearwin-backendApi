import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationsListResponseDto,
  UnreadCountResponseDto,
  MarkAsReadResponseDto,
  MarkAllAsReadResponseDto,
  CreateNotificationDto,
  NotificationStatsResponseDto,
  CreateNotificationWithPushDto,
  BulkNotificationDto,
  BulkNotificationResponseDto,
} from './dto/notification.dto';
import {
  NotificationType,
  LogAction,
  LogLevel,
  PrismaClient,
} from '@prisma/client';
import * as admin from 'firebase-admin';

// FCM Interfaces
export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
  clickAction?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: admin.app.App;
  private prisma: PrismaClient;

  constructor(databaseService: DatabaseService) {
    this.prisma = databaseService as PrismaClient;
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        // Check if Firebase environment variables are set
        if (
          !process.env.FIREBASE_PROJECT_ID ||
          !process.env.FIREBASE_PRIVATE_KEY ||
          !process.env.FIREBASE_CLIENT_EMAIL
        ) {
          this.logger.warn(
            'Firebase environment variables not set. FCM features will be disabled.',
          );
          return;
        }

        // Validate private key format
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey || !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          this.logger.warn(
            'Invalid Firebase private key format. FCM features will be disabled.',
          );
          return;
        }

        const serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
          private_key: privateKey.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID || '',
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url:
            'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        };

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      // Don't throw error during initialization, just log it
      this.logger.warn(
        'FCM features will be disabled due to initialization failure',
      );
    }
  }

  async getUserNotifications(
    userId: string,
    query: NotificationQueryDto,
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
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

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
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications: notifications.map((notification) => ({
          id: notification.id,
          userId: notification.userId,
          type: notification.type as any,
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

  async getNotificationById(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
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
        type: notification.type as any,
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

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<MarkAsReadResponseDto> {
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
        'Notification marked as read',
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
        `Marked ${result.count} notifications as read`,
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
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      return {
        unreadCount,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch unread count');
    }
  }

  async createNotification(
    createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: createDto.userId,
          type: createDto.type as any,
          title: createDto.title,
          message: createDto.message,
          data: createDto.data,
          expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
        },
      });

      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type as any,
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

  async getNotificationStats(
    userId: string,
  ): Promise<NotificationStatsResponseDto> {
    try {
      const [total, unread, byType, recentNotifications, averageReadTime] =
        await Promise.all([
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

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
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
        'Notification deleted',
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

  /**
   * Create notification with push notification support
   */
  async createNotificationWithPush(
    createDto: CreateNotificationWithPushDto,
  ): Promise<NotificationResponseDto> {
    try {
      // Create notification in database
      const notification = await this.prisma.notification.create({
        data: {
          userId: createDto.userId,
          type: createDto.type as any,
          title: createDto.title,
          message: createDto.message,
          data: createDto.data,
          expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
        },
      });

      // Send push notification if requested
      if (createDto.sendPush !== false) {
        try {
          const payload: FCMNotificationPayload = {
            title: createDto.title,
            body: createDto.message,
            data: createDto.data,
            imageUrl: createDto.imageUrl,
            clickAction: createDto.clickAction,
          };

          if (createDto.userIds && createDto.userIds.length > 0) {
            // Send to multiple users
            for (const userId of createDto.userIds) {
              await this.sendToUser(userId, payload);
            }
          } else {
            // Send to single user
            await this.sendToUser(createDto.userId, payload);
          }
        } catch (fcmError) {
          // Log FCM error but don't fail the notification creation
          console.error('FCM push notification failed:', fcmError);
        }
      }

      return {
        id: notification.id,
        userId: notification.userId,
        type: notification.type as any,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        readAt: notification.readAt || undefined,
        expiresAt: notification.expiresAt || undefined,
        createdAt: notification.createdAt,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create notification with push');
    }
  }

  /**
   * Send bulk notifications with push support
   */
  async sendBulkNotifications(
    bulkDto: BulkNotificationDto,
  ): Promise<BulkNotificationResponseDto> {
    const results: Array<{
      userId: string;
      success: boolean;
      message?: string;
      notificationId?: string;
    }> = [];

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
      } catch (error) {
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

  /**
   * Send notification to topic
   */
  async sendNotificationToTopic(
    topic: string,
    title: string,
    message: string,
    data?: any,
    options?: {
      imageUrl?: string;
      clickAction?: string;
      expiresAt?: Date;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload: FCMNotificationPayload = {
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
    } catch (error) {
      throw new BadRequestException('Failed to send topic notification');
    }
  }

  /**
   * Send notification to condition
   */
  async sendNotificationToCondition(
    condition: string,
    title: string,
    message: string,
    data?: any,
    options?: {
      imageUrl?: string;
      clickAction?: string;
      expiresAt?: Date;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload: FCMNotificationPayload = {
        title,
        body: message,
        data,
        imageUrl: options?.imageUrl,
        clickAction: options?.clickAction,
      };

      // For conditions, we'll need to implement a custom method in FCMService
      // This is a placeholder for now
      throw new BadRequestException(
        'Condition-based notifications not yet implemented',
      );

      return {
        success: true,
        message: 'Condition notification sent successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to send condition notification');
    }
  }

  // =================================================================
  // FCM DIRECT IMPLEMENTATIONS
  // =================================================================

  /**
   * Send notification to a single device
   */
  async sendToDevice(
    token: string,
    payload: FCMNotificationPayload,
  ): Promise<string> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase is not initialized. Push notification skipped.');
      return 'firebase-disabled';
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
          priority: 'high' as const,
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
    } catch (error) {
      this.logger.error('Failed to send FCM message:', error);
      throw new BadRequestException('Failed to send push notification');
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    payload: FCMNotificationPayload,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.firebaseApp) {
      throw new BadRequestException(
        'Firebase not initialized. Please check your environment variables.',
      );
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
          priority: 'high' as const,
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
      this.logger.log(
        `FCM multicast sent successfully. Success: ${response.successCount}, Failed: ${response.failureCount}`,
      );

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            this.logger.warn(
              `Failed to send to token ${tokens[idx]}: ${resp.error?.message}`,
            );
          }
        });

        // Remove invalid tokens from database
        if (failedTokens.length > 0) {
          await this.removeInvalidTokens(failedTokens);
        }
      }

      return response;
    } catch (error) {
      this.logger.error('Failed to send FCM multicast:', error);
      throw new BadRequestException('Failed to send push notifications');
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    payload: FCMNotificationPayload,
  ): Promise<string> {
    if (!this.firebaseApp) {
      throw new BadRequestException(
        'Firebase not initialized. Please check your environment variables.',
      );
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
          priority: 'high' as const,
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
    } catch (error) {
      this.logger.error('Failed to send FCM topic message:', error);
      throw new BadRequestException('Failed to send topic notification');
    }
  }

  /**
   * Send notification to a user (all their devices)
   */
  async sendToUser(
    userId: string,
    payload: FCMNotificationPayload,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase is not initialized. Push notification skipped.');
      return {
        successCount: 0,
        failureCount: 0,
        responses: [],
      };
    }

    try {
      // Get all device tokens for the user
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
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${userId}:`,
        error,
      );
      throw new BadRequestException('Failed to send user notification');
    }
  }

  /**
   * Get all active device tokens for a user
   */
  async getUserDeviceTokens(userId: string): Promise<string[]> {
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
    } catch (error) {
      this.logger.error('Failed to get user device tokens:', error);
      return [];
    }
  }

  /**
   * Register a device token for a user
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    deviceInfo?: any,
  ): Promise<void> {
    try {
      // Check if token already exists
      const existingToken = await this.prisma.fCMToken.findFirst({
        where: {
          token,
          userId,
        },
      });

      if (existingToken) {
        // Update existing token
        await this.prisma.fCMToken.update({
          where: { id: existingToken.id },
          data: {
            isActive: true,
            lastUsed: new Date(),
            deviceInfo,
          },
        });
      } else {
        // Create new token
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
    } catch (error) {
      this.logger.error('Failed to register device token:', error);
      throw new BadRequestException('Failed to register device token');
    }
  }

  /**
   * Unregister a device token
   */
  async unregisterDeviceToken(userId: string, token: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to unregister device token:', error);
      throw new BadRequestException('Failed to unregister device token');
    }
  }

  /**
   * Remove invalid tokens from database
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to remove invalid tokens:', error);
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Send a test message to validate the token
      await admin.messaging().send(
        {
          token,
          data: { test: 'true' },
        },
        true,
      ); // dry run
      return true;
    } catch (error) {
      this.logger.warn(`Invalid FCM token: ${token}`, error);
      return false;
    }
  }

  /**
   * Subscribe user to a topic
   */
  async subscribeToTopic(
    tokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(
        `Subscribed ${response.successCount} tokens to topic ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw new BadRequestException('Failed to subscribe to topic');
    }
  }

  /**
   * Unsubscribe user from a topic
   */
  async unsubscribeFromTopic(
    tokens: string[],
    topic: string,
  ): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Unsubscribed ${response.successCount} tokens from topic ${topic}`,
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw new BadRequestException('Failed to unsubscribe from topic');
    }
  }

  /**
   * Get user's FCM tokens
   */
  async getUserFCMTokens(userId: string): Promise<string[]> {
    try {
      return await this.getUserDeviceTokens(userId);
    } catch (error) {
      throw new BadRequestException('Failed to get user FCM tokens');
    }
  }

  /**
   * Register FCM token for user
   */
  async registerFCMToken(
    userId: string,
    token: string,
    deviceInfo?: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.registerDeviceToken(userId, token, deviceInfo);
      return {
        success: true,
        message: 'FCM token registered successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to register FCM token');
    }
  }

  /**
   * Unregister FCM token for user
   */
  async unregisterFCMToken(
    userId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.unregisterDeviceToken(userId, token);
      return {
        success: true,
        message: 'FCM token unregistered successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to unregister FCM token');
    }
  }

  /**
   * Validate FCM token
   */
  async validateFCMToken(
    token: string,
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      const isValid = await this.validateToken(token);
      return {
        isValid,
        message: isValid ? 'Token is valid' : 'Token is invalid',
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Failed to validate token',
      };
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
