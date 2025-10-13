import { DatabaseService } from '../database/database.service';
import { NotificationQueryDto, NotificationResponseDto, NotificationsListResponseDto, UnreadCountResponseDto, MarkAsReadResponseDto, MarkAllAsReadResponseDto, CreateNotificationDto, NotificationStatsResponseDto } from './dto/notification.dto';
export declare class NotificationService {
    private prisma;
    constructor(prisma: DatabaseService);
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
    private logActivity;
}
