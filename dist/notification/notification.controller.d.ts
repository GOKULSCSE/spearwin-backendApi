import { NotificationService } from './notification.service';
import { NotificationQueryDto, NotificationResponseDto, NotificationsListResponseDto, UnreadCountResponseDto, MarkAsReadResponseDto, MarkAllAsReadResponseDto, CreateNotificationDto, NotificationStatsResponseDto } from './dto/notification.dto';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getUserNotifications(query: NotificationQueryDto, user: CurrentUser): Promise<NotificationsListResponseDto>;
    getNotificationById(notificationId: string, user: CurrentUser): Promise<NotificationResponseDto>;
    markAsRead(notificationId: string, user: CurrentUser): Promise<MarkAsReadResponseDto>;
    markAllAsRead(user: CurrentUser): Promise<MarkAllAsReadResponseDto>;
    getUnreadCount(user: CurrentUser): Promise<UnreadCountResponseDto>;
    getNotificationStats(user: CurrentUser): Promise<NotificationStatsResponseDto>;
    deleteNotification(notificationId: string, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
    }>;
    createNotification(createDto: CreateNotificationDto, user: CurrentUser): Promise<NotificationResponseDto>;
}
