import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';

// Define NotificationType enum locally to avoid import issues
export enum NotificationType {
  JOB_ALERT = 'JOB_ALERT',
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  COMPANY_UPDATE = 'COMPANY_UPDATE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  JOB_RECOMMENDATION = 'JOB_RECOMMENDATION',
}

export class NotificationPreferencesDto {
  @IsEnum(NotificationType)
  @IsString()
  type: NotificationType;

  @IsBoolean()
  email: boolean;

  @IsBoolean()
  push: boolean;

  @IsBoolean()
  sms: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}

export class NotificationPreferencesResponseDto {
  preferences: NotificationPreferencesDto[];
  updatedAt: Date;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  preferences?: NotificationPreferencesDto[];
}
