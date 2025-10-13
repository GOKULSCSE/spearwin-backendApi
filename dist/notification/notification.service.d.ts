import { DatabaseService } from '../database/database.service';
import { NotificationQueryDto, NotificationResponseDto, NotificationsListResponseDto, UnreadCountResponseDto, MarkAsReadResponseDto, MarkAllAsReadResponseDto, CreateNotificationDto, NotificationStatsResponseDto, CreateNotificationWithPushDto, BulkNotificationDto, BulkNotificationResponseDto } from './dto/notification.dto';
import * as admin from 'firebase-admin';
export interface FCMNotificationPayload {
    title: string;
    body: string;
    data?: {
        [key: string]: string;
    };
    imageUrl?: string;
    clickAction?: string;
}
export declare class NotificationService {
    private readonly logger;
    private firebaseApp;
    private prisma;
    constructor(databaseService: DatabaseService);
    private initializeFirebase;
    getUserNotifications(userId: string, query: NotificationQueryDto): Promise<NotificationsListResponseDto>;
    getNotificationById(notificationId: string, userId: string): Promise<NotificationResponseDto>;
    markAsRead(notificationId: string, userId: string): Promise<MarkAsReadResponseDto>;
    markAllAsRead(userId: string): Promise<MarkAllAsReadResponseDto>;
    getUnreadCount(userId: string): Promise<UnreadCountResponseDto>;
    createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto>;
    getNotificationStats(userId: string): Promise<NotificationStatsResponseDto>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createNotificationWithPush(createDto: CreateNotificationWithPushDto): Promise<NotificationResponseDto>;
    sendBulkNotifications(bulkDto: BulkNotificationDto): Promise<BulkNotificationResponseDto>;
    sendNotificationToTopic(topic: string, title: string, message: string, data?: any, options?: {
        imageUrl?: string;
        clickAction?: string;
        expiresAt?: Date;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendNotificationToCondition(condition: string, title: string, message: string, data?: any, options?: {
        imageUrl?: string;
        clickAction?: string;
        expiresAt?: Date;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendToDevice(token: string, payload: FCMNotificationPayload): Promise<string>;
    sendToMultipleDevices(tokens: string[], payload: FCMNotificationPayload): Promise<admin.messaging.BatchResponse>;
    sendToTopic(topic: string, payload: FCMNotificationPayload): Promise<string>;
    sendToUser(userId: string, payload: FCMNotificationPayload): Promise<admin.messaging.BatchResponse>;
    getUserDeviceTokens(userId: string): Promise<string[]>;
    registerDeviceToken(userId: string, token: string, deviceInfo?: any): Promise<void>;
    unregisterDeviceToken(userId: string, token: string): Promise<void>;
    private removeInvalidTokens;
    validateToken(token: string): Promise<boolean>;
    subscribeToTopic(tokens: string[], topic: string): Promise<admin.messaging.TopicManagementResponse>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<admin.messaging.TopicManagementResponse>;
    getUserFCMTokens(userId: string): Promise<string[]>;
    registerFCMToken(userId: string, token: string, deviceInfo?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    unregisterFCMToken(userId: string, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateFCMToken(token: string): Promise<{
        isValid: boolean;
        message: string;
    }>;
    private logActivity;
}
