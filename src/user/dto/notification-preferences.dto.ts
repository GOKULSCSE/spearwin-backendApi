import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';

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
