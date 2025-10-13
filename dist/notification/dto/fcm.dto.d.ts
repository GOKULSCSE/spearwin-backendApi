export declare class RegisterFCMTokenDto {
    token: string;
    deviceInfo?: {
        platform?: string;
        appVersion?: string;
        deviceModel?: string;
        osVersion?: string;
    };
}
export declare class UnregisterFCMTokenDto {
    token: string;
}
export declare class FCMTokenResponseDto {
    id: string;
    userId: string;
    token: string;
    isActive: boolean;
    deviceInfo?: any;
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class FCMTokensListResponseDto {
    tokens: FCMTokenResponseDto[];
    total: number;
    activeCount: number;
    inactiveCount: number;
}
export declare class SendPushNotificationDto {
    title: string;
    body: string;
    data?: {
        [key: string]: string;
    };
    imageUrl?: string;
    clickAction?: string;
}
export declare class SendToUserNotificationDto extends SendPushNotificationDto {
    userId: string;
}
export declare class SendToMultipleUsersNotificationDto extends SendPushNotificationDto {
    userIds: string[];
}
export declare class SendToTokenNotificationDto extends SendPushNotificationDto {
    token: string;
}
export declare class SendToMultipleTokensNotificationDto extends SendPushNotificationDto {
    tokens: string[];
}
export declare class SendToTopicNotificationDto extends SendPushNotificationDto {
    topic: string;
}
export declare class SendToConditionNotificationDto extends SendPushNotificationDto {
    condition: string;
}
export declare class SubscribeToTopicDto {
    tokens: string[];
    topic: string;
}
export declare class UnsubscribeFromTopicDto {
    tokens: string[];
    topic: string;
}
export declare class FCMResponseDto {
    success: boolean;
    message: string;
    messageId?: string;
    successCount?: number;
    failureCount?: number;
    failedTokens?: string[];
}
export declare class FCMTopicResponseDto {
    success: boolean;
    message: string;
    successCount: number;
    failureCount: number;
    errors?: Array<{
        index: number;
        error: {
            code: string;
            message: string;
        };
    }>;
}
export declare class ValidateTokenDto {
    token: string;
}
export declare class ValidateTokenResponseDto {
    isValid: boolean;
    message: string;
}
export declare class CreateNotificationWithPushDto {
    userId: string;
    userIds?: string[];
    title: string;
    message: string;
    data?: any;
    imageUrl?: string;
    clickAction?: string;
    expiresAt?: string;
    sendPush?: boolean;
    topic?: string;
    condition?: string;
}
export declare class BulkNotificationDto {
    notifications: CreateNotificationWithPushDto[];
}
export declare class BulkNotificationResponseDto {
    success: boolean;
    message: string;
    totalNotifications: number;
    successfulNotifications: number;
    failedNotifications: number;
    results: Array<{
        userId: string;
        success: boolean;
        message?: string;
        notificationId?: string;
    }>;
}
