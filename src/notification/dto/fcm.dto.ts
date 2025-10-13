import { IsString, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

// =================================================================
// FCM TOKEN MANAGEMENT DTOs
// =================================================================

export class RegisterFCMTokenDto {
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsOptional()
  @IsObject({ message: 'info must be an object' })
  deviceInfo?: {
    platform?: string;
    appVersion?: string;
    deviceModel?: string;
    osVersion?: string;
  };
}

export class UnregisterFCMTokenDto {
  @IsString({ message: 'Token must be a string' })
  token: string;
}

export class FCMTokenResponseDto {
  id: string;
  userId: string;
  token: string;
  isActive: boolean;
  deviceInfo?: any;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class FCMTokensListResponseDto {
  tokens: FCMTokenResponseDto[];
  total: number;
  activeCount: number;
  inactiveCount: number;
}

// =================================================================
// FCM PUSH NOTIFICATION DTOs
// =================================================================

export class SendPushNotificationDto {
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Body must be a string' })
  body: string;

  @IsOptional()
  @IsObject({ message: 'Data must be an object' })
  data?: { [key: string]: string };

  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Click action must be a string' })
  clickAction?: string;
}

export class SendToUserNotificationDto extends SendPushNotificationDto {
  @IsString({ message: 'User ID must be a string' })
  userId: string;
}

export class SendToMultipleUsersNotificationDto extends SendPushNotificationDto {
  @IsArray({ message: 'User IDs must be an array' })
  @IsString({ each: true, message: 'Each user ID must be a string' })
  userIds: string[];
}

export class SendToTokenNotificationDto extends SendPushNotificationDto {
  @IsString({ message: 'Token must be a string' })
  token: string;
}

export class SendToMultipleTokensNotificationDto extends SendPushNotificationDto {
  @IsArray({ message: 'Tokens must be an array' })
  @IsString({ each: true, message: 'Each token must be a string' })
  tokens: string[];
}

export class SendToTopicNotificationDto extends SendPushNotificationDto {
  @IsString({ message: 'Topic must be a string' })
  topic: string;
}

export class SendToConditionNotificationDto extends SendPushNotificationDto {
  @IsString({ message: 'Condition must be a string' })
  condition: string;
}

// =================================================================
// FCM TOPIC MANAGEMENT DTOs
// =================================================================

export class SubscribeToTopicDto {
  @IsArray({ message: 'Tokens must be an array' })
  @IsString({ each: true, message: 'Each token must be a string' })
  tokens: string[];

  @IsString({ message: 'Topic must be a string' })
  topic: string;
}

export class UnsubscribeFromTopicDto {
  @IsArray({ message: 'Tokens must be an array' })
  @IsString({ each: true, message: 'Each token must be a string' })
  tokens: string[];

  @IsString({ message: 'Topic must be a string' })
  topic: string;
}

// =================================================================
// FCM RESPONSE DTOs
// =================================================================

export class FCMResponseDto {
  success: boolean;
  message: string;
  messageId?: string;
  successCount?: number;
  failureCount?: number;
  failedTokens?: string[];
}

export class FCMTopicResponseDto {
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

// =================================================================
// FCM VALIDATION DTOs
// =================================================================

export class ValidateTokenDto {
  @IsString({ message: 'Token must be a string' })
  token: string;
}

export class ValidateTokenResponseDto {
  isValid: boolean;
  message: string;
}

// =================================================================
// FCM NOTIFICATION WITH DATABASE DTOs
// =================================================================

export class CreateNotificationWithPushDto {
  @IsString({ message: 'User ID must be a string' })
  userId: string;

  @IsOptional()
  @IsArray({ message: 'User IDs must be an array' })
  @IsString({ each: true, message: 'Each user ID must be a string' })
  userIds?: string[];

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
  @IsString({ message: 'Expires at must be a string' })
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
