import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import {
  UpdateNotificationPreferencesDto,
  NotificationPreferencesResponseDto,
} from './dto/notification-preferences.dto';
import { RecentUsersQueryDto } from './dto/recent-users-query.dto';
import { RecentUsersStatsQueryDto } from './dto/recent-users-stats-query.dto';
import { UserProfilesQueryDto } from './dto/user-profiles-query.dto';
import type { UserProfileResponseDto } from './dto/user-profile-response.dto';
import type { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
import type { RecentUsersResponseDto } from './dto/recent-users-response.dto';
import type { UserProfilesListResponseDto } from './dto/user-profiles-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GetCurrentUser,
  type CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Legacy endpoints (keeping for backward compatibility)
  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Status-specific routes (must be before :id route)
  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveUsers(
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ users: any[] }> {
    return this.userService.getActiveUsers(sortBy, sortOrder);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async getPendingUsers(
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ users: any[] }> {
    return this.userService.getPendingUsers(sortBy, sortOrder);
  }

  @Get('inactive')
  @UseGuards(JwtAuthGuard)
  async getInactiveUsers(
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ users: any[] }> {
    return this.userService.getInactiveUsers(sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // New User Profile APIs
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserProfile(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getCurrentUserProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateCurrentUserProfile(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.userService.updateCurrentUserProfile(user.id, updateProfileDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteUserAccount(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.userService.deleteUserAccount(user.id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(user.id, changePasswordDto);
  }

  @Get('activity-logs')
  @UseGuards(JwtAuthGuard)
  async getUserActivityLogs(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: ActivityLogsQueryDto,
  ): Promise<ActivityLogsResponseDto> {
    return this.userService.getUserActivityLogs(user.id, query);
  }

  @Get('notification-preferences')
  @UseGuards(JwtAuthGuard)
  async getNotificationPreferences(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<NotificationPreferencesResponseDto> {
    return this.userService.getNotificationPreferences(user.id);
  }

  @Put('notification-preferences')
  @UseGuards(JwtAuthGuard)
  async updateNotificationPreferences(
    @GetCurrentUser() user: CurrentUser,
    @Body(ValidationPipe)
    updatePreferencesDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    return this.userService.updateNotificationPreferences(
      user.id,
      updatePreferencesDto,
    );
  }

  @Post('notification-preferences/test')
  @UseGuards(JwtAuthGuard)
  async testNotificationSettings(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<{ message: string }> {
    return this.userService.testNotificationSettings(user.id);
  }

  // =================================================================
  // USER PROFILES MANAGEMENT API (Admin Only)
  // =================================================================

  @Get('profiles')
  @UseGuards(JwtAuthGuard)
  async getUserProfiles(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: UserProfilesQueryDto,
  ): Promise<UserProfilesListResponseDto> {
    return this.userService.getUserProfiles(query);
  }

  // =================================================================
  // RECENT USERS API (Admin Only)
  // =================================================================

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async getRecentUsers(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: RecentUsersQueryDto,
  ): Promise<RecentUsersResponseDto> {
    return this.userService.getRecentUsers(query);
  }

  @Get('recent/stats')
  @UseGuards(JwtAuthGuard)
  async getRecentUsersStats(
    @GetCurrentUser() user: CurrentUser,
    @Query(ValidationPipe) query: RecentUsersStatsQueryDto,
  ): Promise<RecentUsersResponseDto> {
    return this.userService.getRecentUsersStats(query);
  }
}
