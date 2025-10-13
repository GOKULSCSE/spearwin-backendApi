import { NotificationType } from '@prisma/client';
export declare class NotificationQueryDto {
    search?: string;
    type?: NotificationType;
    isRead?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
}
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: Date | null;
    expiresAt?: Date | null;
    createdAt: Date;
}
export declare class NotificationsListResponseDto {
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    unreadCount: number;
}
export declare class UnreadCountResponseDto {
    unreadCount: number;
}
export declare class MarkAsReadResponseDto {
    success: boolean;
    message: string;
}
export declare class MarkAllAsReadResponseDto {
    success: boolean;
    message: string;
    updatedCount: number;
}
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    expiresAt?: string;
}
export declare class NotificationStatsResponseDto {
    total: number;
    unread: number;
    byType: {
        JOB_ALERT: number;
        APPLICATION_UPDATE: number;
        SYSTEM_NOTIFICATION: number;
        SECURITY_ALERT: number;
        COMPANY_UPDATE: number;
    };
    recentNotifications: number;
    averageReadTime: number;
}
