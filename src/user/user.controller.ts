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
import type { UserProfileResponseDto } from './dto/user-profile-response.dto';
import type { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
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
}
