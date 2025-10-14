import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NotificationType } from '@prisma/client';

// =================================================================
// NOTIFICATION MANAGEMENT DTOs
// =================================================================

export class NotificationQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type?: NotificationType;

  @IsOptional()
  @IsBoolean({ message: 'Is read must be a boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isRead?: boolean;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}

export class NotificationResponseDto {
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

export class NotificationsListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  unreadCount: number;
}

export class UnreadCountResponseDto {
  unreadCount: number;
}

export class MarkAsReadResponseDto {
  success: boolean;
  message: string;
}

export class MarkAllAsReadResponseDto {
  success: boolean;
  message: string;
  updatedCount: number;
}

export class CreateNotificationDto {
  @IsString({ message: 'User ID must be a string' })
  userId: string;

  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: NotificationType;

  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Message must be a string' })
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date' })
  expiresAt?: string;
}

export class NotificationStatsResponseDto {
  total: number;
  unread: number;
  byType: {
    JOB_ALERT: number;
    APPLICATION_UPDATE: number;
    SYSTEM_NOTIFICATION: number;
    SECURITY_ALERT: number;
    COMPANY_UPDATE: number;
  };
  recentNotifications: number; // Notifications in last 7 days
  averageReadTime: number; // Average time to read in hours
}

// =================================================================
// FCM INTEGRATION DTOs
// =================================================================

export class CreateNotificationWithPushDto {
  @IsString({ message: 'User ID must be a string' })
  userId: string;

  @IsOptional()
  @IsArray({ message: 'User IDs must be an array' })
  @IsString({ each: true, message: 'Each user ID must be a string' })
  userIds?: string[];

  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: NotificationType;

  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Message must be a string' })
  message: string;

  @IsOptional()
  @IsObject({ message: 'Data must be an object' })
  data?: any;

  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Click action must be a string' })
  clickAction?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date' })
  expiresAt?: string;

  @IsOptional()
  @IsBoolean({ message: 'Send push must be a boolean' })
  sendPush?: boolean;

  @IsOptional()
  @IsString({ message: 'Topic must be a string' })
  topic?: string;

  @IsOptional()
  @IsString({ message: 'Condition must be a string' })
  condition?: string;
}

export class BulkNotificationDto {
  @IsArray({ message: 'Notifications must be an array' })
  notifications: CreateNotificationWithPushDto[];
}

export class BulkNotificationResponseDto {
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
