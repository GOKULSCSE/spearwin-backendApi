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
  NotificationStatsResponseDto
} from './dto/notification.dto';
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
    return this.notificationService.getNotificationById(notificationId, user.id);
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
}
