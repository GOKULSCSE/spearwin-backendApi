import { NotificationType } from '@prisma/client';
export declare class NotificationPreferencesDto {
    type: NotificationType;
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp?: boolean;
}
export declare class NotificationPreferencesResponseDto {
    preferences: NotificationPreferencesDto[];
    updatedAt: Date;
}
export declare class UpdateNotificationPreferencesDto {
    preferences?: NotificationPreferencesDto[];
}
