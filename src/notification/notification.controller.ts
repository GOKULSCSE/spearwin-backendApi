import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationsListResponseDto,
  UnreadCountResponseDto,
  MarkAsReadResponseDto,
  MarkAllAsReadResponseDto,
  CreateNotificationDto,
  NotificationStatsResponseDto,
  CreateNotificationWithPushDto,
  BulkNotificationDto,
  BulkNotificationResponseDto,
} from './dto/notification.dto';
import {
  RegisterFCMTokenDto,
  UnregisterFCMTokenDto,
  FCMTokenResponseDto,
  FCMTokensListResponseDto,
  SendPushNotificationDto,
  SendToUserNotificationDto,
  SendToMultipleUsersNotificationDto,
  SendToTokenNotificationDto,
  SendToMultipleTokensNotificationDto,
  SendToTopicNotificationDto,
  SendToConditionNotificationDto,
  SubscribeToTopicDto,
  UnsubscribeFromTopicDto,
  FCMResponseDto,
  FCMTopicResponseDto,
  ValidateTokenDto,
  ValidateTokenResponseDto,
} from './dto/fcm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Query(ValidationPipe) query: NotificationQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationsListResponseDto> {
    return this.notificationService.getUserNotifications(user.id, query);
  }

  @Get(':id')
  async getNotificationById(
    @Param('id') notificationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.getNotificationById(
      notificationId,
      user.id,
    );
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') notificationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<MarkAsReadResponseDto> {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Put('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<MarkAllAsReadResponseDto> {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<UnreadCountResponseDto> {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Get('stats')
  async getNotificationStats(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationStatsResponseDto> {
    return this.notificationService.getNotificationStats(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id') notificationId: string,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.notificationService.deleteNotification(notificationId, user.id);
  }

  // =================================================================
  // ADMIN ENDPOINTS (for creating notifications)
  // =================================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(
    @Body(ValidationPipe) createDto: CreateNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationResponseDto> {
    // Only allow admins to create notifications for other users
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can create notifications');
    }

    return this.notificationService.createNotification(createDto);
  }

  @Post('with-push')
  @HttpCode(HttpStatus.CREATED)
  async createNotificationWithPush(
    @Body(ValidationPipe) createDto: CreateNotificationWithPushDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationResponseDto> {
    // Only allow admins to create notifications for other users
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can create notifications');
    }

    return this.notificationService.createNotificationWithPush(createDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async sendBulkNotifications(
    @Body(ValidationPipe) bulkDto: BulkNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<BulkNotificationResponseDto> {
    // Only allow admins to send bulk notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send bulk notifications');
    }

    return this.notificationService.sendBulkNotifications(bulkDto);
  }

  // =================================================================
  // FCM TOKEN MANAGEMENT ENDPOINTS
  // =================================================================

  @Post('fcm/register')
  @HttpCode(HttpStatus.CREATED)
  async registerFCMToken(
    @Body(ValidationPipe) registerDto: RegisterFCMTokenDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.notificationService.registerFCMToken(
      user.id,
      registerDto.token,
      registerDto.deviceInfo,
    );
  }

  @Post('fcm/unregister')
  @HttpCode(HttpStatus.OK)
  async unregisterFCMToken(
    @Body(ValidationPipe) unregisterDto: UnregisterFCMTokenDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.notificationService.unregisterFCMToken(
      user.id,
      unregisterDto.token,
    );
  }

  @Get('fcm/tokens')
  async getUserFCMTokens(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<string[]> {
    return this.notificationService.getUserFCMTokens(user.id);
  }

  @Post('fcm/validate')
  @HttpCode(HttpStatus.OK)
  async validateFCMToken(
    @Body(ValidationPipe) validateDto: ValidateTokenDto,
  ): Promise<ValidateTokenResponseDto> {
    return this.notificationService.validateFCMToken(validateDto.token);
  }

  // =================================================================
  // FCM PUSH NOTIFICATION ENDPOINTS
  // =================================================================

  @Post('fcm/send-to-user')
  @HttpCode(HttpStatus.OK)
  async sendToUser(
    @Body(ValidationPipe) sendDto: SendToUserNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMResponseDto> {
    // Only allow admins to send push notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send push notifications');
    }

    try {
      const response = await this.notificationService.sendToUser(
        sendDto.userId,
        {
          title: sendDto.title,
          body: sendDto.body,
          data: sendDto.data,
          imageUrl: sendDto.imageUrl,
          clickAction: sendDto.clickAction,
        },
      );

      return {
        success: true,
        message: 'Push notification sent successfully',
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send push notification',
      };
    }
  }

  @Post('fcm/send-to-multiple-users')
  @HttpCode(HttpStatus.OK)
  async sendToMultipleUsers(
    @Body(ValidationPipe) sendDto: SendToMultipleUsersNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMResponseDto> {
    // Only allow admins to send push notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send push notifications');
    }

    try {
      let totalSuccess = 0;
      let totalFailure = 0;
      const failedUsers: string[] = [];

      for (const userId of sendDto.userIds) {
        try {
          const response = await this.notificationService.sendToUser(userId, {
            title: sendDto.title,
            body: sendDto.body,
            data: sendDto.data,
            imageUrl: sendDto.imageUrl,
            clickAction: sendDto.clickAction,
          });
          totalSuccess += response.successCount;
          totalFailure += response.failureCount;
        } catch (error) {
          totalFailure++;
          failedUsers.push(userId);
        }
      }

      return {
        success: totalFailure === 0,
        message: `Push notifications sent. ${totalSuccess} successful, ${totalFailure} failed.`,
        successCount: totalSuccess,
        failureCount: totalFailure,
        failedTokens: failedUsers,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send push notifications',
      };
    }
  }

  @Post('fcm/send-to-token')
  @HttpCode(HttpStatus.OK)
  async sendToToken(
    @Body(ValidationPipe) sendDto: SendToTokenNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMResponseDto> {
    // Only allow admins to send push notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send push notifications');
    }

    try {
      const messageId = await this.notificationService.sendToDevice(
        sendDto.token,
        {
          title: sendDto.title,
          body: sendDto.body,
          data: sendDto.data,
          imageUrl: sendDto.imageUrl,
          clickAction: sendDto.clickAction,
        },
      );

      return {
        success: true,
        message: 'Push notification sent successfully',
        messageId,
        successCount: 1,
        failureCount: 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send push notification',
        successCount: 0,
        failureCount: 1,
      };
    }
  }

  @Post('fcm/send-to-multiple-tokens')
  @HttpCode(HttpStatus.OK)
  async sendToMultipleTokens(
    @Body(ValidationPipe) sendDto: SendToMultipleTokensNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMResponseDto> {
    // Only allow admins to send push notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send push notifications');
    }

    try {
      const response = await this.notificationService.sendToMultipleDevices(
        sendDto.tokens,
        {
          title: sendDto.title,
          body: sendDto.body,
          data: sendDto.data,
          imageUrl: sendDto.imageUrl,
          clickAction: sendDto.clickAction,
        },
      );

      return {
        success: response.failureCount === 0,
        message: `Push notifications sent. ${response.successCount} successful, ${response.failureCount} failed.`,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send push notifications',
      };
    }
  }

  @Post('fcm/send-to-topic')
  @HttpCode(HttpStatus.OK)
  async sendToTopic(
    @Body(ValidationPipe) sendDto: SendToTopicNotificationDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMResponseDto> {
    // Only allow admins to send push notifications
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only admins can send push notifications');
    }

    try {
      const messageId = await this.notificationService.sendToTopic(
        sendDto.topic,
        {
          title: sendDto.title,
          body: sendDto.body,
          data: sendDto.data,
          imageUrl: sendDto.imageUrl,
          clickAction: sendDto.clickAction,
        },
      );

      return {
        success: true,
        message: 'Topic notification sent successfully',
        messageId,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send topic notification',
      };
    }
  }

  // =================================================================
  // FCM TOPIC MANAGEMENT ENDPOINTS
  // =================================================================

  @Post('fcm/subscribe-to-topic')
  @HttpCode(HttpStatus.OK)
  async subscribeToTopic(
    @Body(ValidationPipe) subscribeDto: SubscribeToTopicDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMTopicResponseDto> {
    try {
      const response = await this.notificationService.subscribeToTopic(
        subscribeDto.tokens,
        subscribeDto.topic,
      );

      return {
        success: response.failureCount === 0,
        message: `Topic subscription processed. ${response.successCount} successful, ${response.failureCount} failed.`,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to subscribe to topic',
        successCount: 0,
        failureCount: subscribeDto.tokens.length,
      };
    }
  }

  @Post('fcm/unsubscribe-from-topic')
  @HttpCode(HttpStatus.OK)
  async unsubscribeFromTopic(
    @Body(ValidationPipe) unsubscribeDto: UnsubscribeFromTopicDto,
    @GetCurrentUser() user: CurrentUser,
  ): Promise<FCMTopicResponseDto> {
    try {
      const response = await this.notificationService.unsubscribeFromTopic(
        unsubscribeDto.tokens,
        unsubscribeDto.topic,
      );

      return {
        success: response.failureCount === 0,
        message: `Topic unsubscription processed. ${response.successCount} successful, ${response.failureCount} failed.`,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to unsubscribe from topic',
        successCount: 0,
        failureCount: unsubscribeDto.tokens.length,
      };
    }
  }
}
