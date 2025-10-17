export declare enum NotificationType {
    JOB_ALERT = "JOB_ALERT",
    APPLICATION_UPDATE = "APPLICATION_UPDATE",
    PROFILE_UPDATE = "PROFILE_UPDATE",
    SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
    SECURITY_ALERT = "SECURITY_ALERT",
    COMPANY_UPDATE = "COMPANY_UPDATE",
    NEW_MESSAGE = "NEW_MESSAGE",
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
    JOB_RECOMMENDATION = "JOB_RECOMMENDATION"
}
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
