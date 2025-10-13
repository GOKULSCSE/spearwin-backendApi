import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString, IsObject } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class SendNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;

  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;
}

export class BroadcastNotificationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleFilters?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeUserIds?: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;

  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;
}

export class CreateNotificationTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  defaultData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  defaultData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class NotificationTemplateResponseDto {
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

export class SendNotificationResponseDto {
  message: string;
  notificationsSent: number;
  failedUsers: string[];
  details?: {
    totalUsers: number;
    successfulSends: number;
    failedSends: number;
  };
}

export class BroadcastNotificationResponseDto {
  message: string;
  notificationsSent: number;
  totalUsers: number;
  filters?: {
    roleFilters?: string[];
    excludeUserIds?: string[];
  };
}

export class NotificationTemplatesListResponseDto {
  templates: NotificationTemplateResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
