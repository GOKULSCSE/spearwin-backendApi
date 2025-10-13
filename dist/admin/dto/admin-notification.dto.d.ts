import { NotificationType } from '@prisma/client';
export declare class SendNotificationDto {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    expiresAt?: string;
    sendEmail?: boolean;
    sendPush?: boolean;
    sendSms?: boolean;
}
export declare class BroadcastNotificationDto {
    userIds?: string[];
    roleFilters?: string[];
    excludeUserIds?: string[];
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    expiresAt?: string;
    sendEmail?: boolean;
    sendPush?: boolean;
    sendSms?: boolean;
}
export declare class CreateNotificationTemplateDto {
    name: string;
    description: string;
    type: NotificationType;
    title: string;
    message: string;
    defaultData?: Record<string, any>;
    variables?: string[];
    isActive?: boolean;
}
export declare class UpdateNotificationTemplateDto {
    name?: string;
    description?: string;
    type?: NotificationType;
    title?: string;
    message?: string;
    defaultData?: Record<string, any>;
    variables?: string[];
    isActive?: boolean;
}
export declare class NotificationTemplateResponseDto {
    id: string;
    name: string;
    description?: string;
    type: NotificationType;
    title: string;
    message: string;
    defaultData?: Record<string, any>;
    variables?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SendNotificationResponseDto {
    message: string;
    notificationsSent: number;
    failedUsers: string[];
    details?: {
        totalUsers: number;
        successfulSends: number;
        failedSends: number;
    };
}
export declare class BroadcastNotificationResponseDto {
    message: string;
    notificationsSent: number;
    totalUsers: number;
    filters?: {
        roleFilters?: string[];
        excludeUserIds?: string[];
    };
}
export declare class NotificationTemplatesListResponseDto {
    templates: NotificationTemplateResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class NotificationQueryDto {
    search?: string;
    type?: NotificationType;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
