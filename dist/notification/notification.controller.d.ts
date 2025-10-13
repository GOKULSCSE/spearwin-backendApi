import { NotificationService } from './notification.service';
import { NotificationQueryDto, NotificationResponseDto, NotificationsListResponseDto, UnreadCountResponseDto, MarkAsReadResponseDto, MarkAllAsReadResponseDto, CreateNotificationDto, NotificationStatsResponseDto, CreateNotificationWithPushDto, BulkNotificationDto, BulkNotificationResponseDto } from './dto/notification.dto';
import { RegisterFCMTokenDto, UnregisterFCMTokenDto, SendToUserNotificationDto, SendToMultipleUsersNotificationDto, SendToTokenNotificationDto, SendToMultipleTokensNotificationDto, SendToTopicNotificationDto, SubscribeToTopicDto, UnsubscribeFromTopicDto, FCMResponseDto, FCMTopicResponseDto, ValidateTokenDto, ValidateTokenResponseDto } from './dto/fcm.dto';
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
    createNotificationWithPush(createDto: CreateNotificationWithPushDto, user: CurrentUser): Promise<NotificationResponseDto>;
    sendBulkNotifications(bulkDto: BulkNotificationDto, user: CurrentUser): Promise<BulkNotificationResponseDto>;
    registerFCMToken(registerDto: RegisterFCMTokenDto, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
    }>;
    unregisterFCMToken(unregisterDto: UnregisterFCMTokenDto, user: CurrentUser): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserFCMTokens(user: CurrentUser): Promise<string[]>;
    validateFCMToken(validateDto: ValidateTokenDto): Promise<ValidateTokenResponseDto>;
    sendToUser(sendDto: SendToUserNotificationDto, user: CurrentUser): Promise<FCMResponseDto>;
    sendToMultipleUsers(sendDto: SendToMultipleUsersNotificationDto, user: CurrentUser): Promise<FCMResponseDto>;
    sendToToken(sendDto: SendToTokenNotificationDto, user: CurrentUser): Promise<FCMResponseDto>;
    sendToMultipleTokens(sendDto: SendToMultipleTokensNotificationDto, user: CurrentUser): Promise<FCMResponseDto>;
    sendToTopic(sendDto: SendToTopicNotificationDto, user: CurrentUser): Promise<FCMResponseDto>;
    subscribeToTopic(subscribeDto: SubscribeToTopicDto, user: CurrentUser): Promise<FCMTopicResponseDto>;
    unsubscribeFromTopic(unsubscribeDto: UnsubscribeFromTopicDto, user: CurrentUser): Promise<FCMTopicResponseDto>;
}
