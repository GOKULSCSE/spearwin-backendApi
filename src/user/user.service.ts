import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import {
  UpdateNotificationPreferencesDto,
  NotificationPreferencesDto,
  NotificationPreferencesResponseDto,
  NotificationType,
} from './dto/notification-preferences.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
import { RecentUsersResponseDto } from './dto/recent-users-response.dto';
import {
  Prisma,
  UserRole,
  UserStatus,
  LogAction,
  LogLevel,
} from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      return await this.db.user.create({ data: createUserDto });
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll() {
    try {
      const data = await this.db.user.findMany();
      return data;
    } catch (error) {
      this.handleException(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // Get current user profile
  async getCurrentUserProfile(userId: string): Promise<UserProfileResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        include: {
          candidate: {
            include: {
              city: {
                include: {
                  state: {
                    include: {
                      country: true,
                    },
                  },
                },
              },
            },
          },
          admin: true,
          superAdmin: true,
          company: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user as unknown as UserProfileResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  // Update current user profile
  async updateCurrentUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if email is being changed and if it's already taken
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.db.user.findUnique({
          where: { email: updateProfileDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('Email is already in use');
        }
      }

      // Check if phone is being changed and if it's already taken
      if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
        const existingUser = await this.db.user.findUnique({
          where: { phone: updateProfileDto.phone },
        });

        if (existingUser) {
          throw new BadRequestException('Phone number is already in use');
        }
      }

      const updatedUser = await this.db.user.update({
        where: { id: userId },
        data: {
          ...updateProfileDto,
          emailVerified:
            updateProfileDto.email && updateProfileDto.email !== user.email
              ? false
              : user.emailVerified,
          phoneVerified:
            updateProfileDto.phone && updateProfileDto.phone !== user.phone
              ? false
              : user.phoneVerified,
        },
        include: {
          candidate: {
            include: {
              city: {
                include: {
                  state: {
                    include: {
                      country: true,
                    },
                  },
                },
              },
            },
          },
          admin: true,
          superAdmin: true,
          company: true,
        },
      });

      // Log the profile update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'User',
        userId,
        'Profile updated',
      );

      return updatedUser as unknown as UserProfileResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  // Delete user account
  async deleteUserAccount(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete user (cascade will handle related records)
      await this.db.user.delete({
        where: { id: userId },
      });

      // Log the account deletion
      await this.logActivity(
        userId,
        LogAction.DELETE,
        LogLevel.CRITICAL,
        'User',
        userId,
        'Account deleted',
      );

      return { message: 'Account deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  // Change password
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        12,
      );

      // Update password
      await this.db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Log the password change
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'User',
        userId,
        'Password changed',
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  // Get user activity logs
  async getUserActivityLogs(
    userId: string,
    query: ActivityLogsQueryDto,
  ): Promise<ActivityLogsResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const {
        action,
        level,
        entity,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.ActivityLogWhereInput = {
        userId,
      };

      if (action) {
        where.action = action as any;
      }

      if (level) {
        where.level = level as any;
      }

      if (entity) {
        where.entity = entity;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Get logs and total count
      const [logs, total] = await Promise.all([
        this.db.activityLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.activityLog.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          level: log.level,
          entity: log.entity,
          entityId: log.entityId,
          description: log.description,
          metadata: log.metadata,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error; // This will never be reached but satisfies TypeScript
    }
  }

  // Get notification preferences
  async getNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferencesResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get user's notification settings from UserSetting table
      const settings = await this.db.userSetting.findMany({
        where: {
          userId,
          key: {
            in: [
              'notification_job_alert_email',
              'notification_job_alert_push',
              'notification_job_alert_sms',
              'notification_job_alert_in_app',
              'notification_application_update_email',
              'notification_application_update_push',
              'notification_application_update_sms',
              'notification_application_update_in_app',
              'notification_system_notification_email',
              'notification_system_notification_push',
              'notification_system_notification_sms',
              'notification_system_notification_in_app',
              'notification_security_alert_email',
              'notification_security_alert_push',
              'notification_security_alert_sms',
              'notification_security_alert_in_app',
              'notification_company_update_email',
              'notification_company_update_push',
              'notification_company_update_sms',
              'notification_company_update_in_app',
            ],
          },
        },
      });

      // Default preferences if no settings exist
      const defaultPreferences: NotificationPreferencesDto[] = [
        {
          type: NotificationType.JOB_ALERT,
          email: true,
          push: true,
          sms: false,
          inApp: true,
        },
        {
          type: NotificationType.APPLICATION_UPDATE,
          email: true,
          push: true,
          sms: false,
          inApp: true,
        },
        {
          type: NotificationType.SYSTEM_NOTIFICATION,
          email: true,
          push: true,
          sms: false,
          inApp: true,
        },
        {
          type: NotificationType.SECURITY_ALERT,
          email: true,
          push: true,
          sms: true,
          inApp: true,
        },
        {
          type: NotificationType.COMPANY_UPDATE,
          email: true,
          push: true,
          sms: false,
          inApp: true,
        },
      ];

      // Map settings to preferences
      const preferences = defaultPreferences.map((pref) => {
        const settingMap = {
          email: `notification_${pref.type.toLowerCase()}_email`,
          push: `notification_${pref.type.toLowerCase()}_push`,
          sms: `notification_${pref.type.toLowerCase()}_sms`,
          inApp: `notification_${pref.type.toLowerCase()}_in_app`,
        };

        const prefSettings = settings.filter((setting) =>
          Object.values(settingMap).includes(setting.key),
        );

        return {
          type: pref.type,
          email:
            prefSettings.find((s) => s.key === settingMap.email)?.value ===
              'true' || pref.email,
          push:
            prefSettings.find((s) => s.key === settingMap.push)?.value ===
              'true' || pref.push,
          sms:
            prefSettings.find((s) => s.key === settingMap.sms)?.value ===
              'true' || pref.sms,
          inApp:
            prefSettings.find((s) => s.key === settingMap.inApp)?.value ===
              'true' || pref.inApp,
        };
      });

      // For now, use current timestamp as we don't track preference update time specifically
      const latestUpdate = new Date();

      return {
        preferences,
        updatedAt: latestUpdate,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    updatePreferencesDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const preferences = updatePreferencesDto.preferences || [];

      // Update or create settings for each preference
      for (const pref of preferences) {
        const settingMap = {
          email: `notification_${pref.type.toLowerCase()}_email`,
          push: `notification_${pref.type.toLowerCase()}_push`,
          sms: `notification_${pref.type.toLowerCase()}_sms`,
          inApp: `notification_${pref.type.toLowerCase()}_in_app`,
        };

        // Upsert each setting
        for (const [channel, key] of Object.entries(settingMap)) {
          await this.db.userSetting.upsert({
            where: {
              userId_key: {
                userId,
                key,
              },
            },
            update: {
              value: pref[
                channel as keyof NotificationPreferencesDto
              ] as string,
              category: 'notification_preferences',
            },
            create: {
              userId,
              key,
              value: pref[
                channel as keyof NotificationPreferencesDto
              ] as string,
              category: 'notification_preferences',
            },
          });
        }
      }

      // Log the preferences update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'User',
        userId,
        'Notification preferences updated',
      );

      // Return updated preferences
      return this.getNotificationPreferences(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // Test notification settings
  async testNotificationSettings(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get user's notification preferences
      const preferencesResponse = await this.getNotificationPreferences(userId);

      // Here you would implement the actual notification sending logic
      // For now, we'll just simulate creating test notifications

      const enabledNotifications: string[] = [];

      for (const pref of preferencesResponse.preferences) {
        if (pref.email) enabledNotifications.push(`${pref.type} - Email`);
        if (pref.push) enabledNotifications.push(`${pref.type} - Push`);
        if (pref.sms) enabledNotifications.push(`${pref.type} - SMS`);
        if (pref.inApp) enabledNotifications.push(`${pref.type} - In-App`);
      }

      if (enabledNotifications.length === 0) {
        return { message: 'No notification channels are enabled for testing' };
      }

      // Create test notifications in the database
      for (const notificationType of [
        'JOB_ALERT',
        'APPLICATION_UPDATE',
        'SYSTEM_NOTIFICATION',
      ]) {
        await this.db.notification.create({
          data: {
            userId,
            type: notificationType as any,
            title: 'Test Notification',
            message: `This is a test notification for ${notificationType.replace('_', ' ').toLowerCase()}. Your notification settings are working correctly.`,
            data: { test: true, timestamp: new Date().toISOString() },
          },
        });
      }

      // Log the test action
      await this.logActivity(
        userId,
        LogAction.CREATE,
        LogLevel.INFO,
        'User',
        userId,
        'Test notifications sent',
      );

      return {
        message: `Test notifications sent successfully. Enabled channels: ${enabledNotifications.join(', ')}`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  // Helper method to log activity
  private async logActivity(
    userId: string,
    action: LogAction,
    level: LogLevel,
    entity: string,
    entityId: string,
    description: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.db.activityLog.create({
        data: {
          userId,
          action,
          level,
          entity,
          entityId,
          description,
          metadata,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Don't throw error for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  handleException(error) {
    throw new InternalServerErrorException("Can't fetch user Details");
  }

  // =================================================================
  // RECENT USERS API
  // =================================================================

  async getRecentUsers(query: any): Promise<any> {
    try {
      const {
        role,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        days = 7
      } = query;

      const skip = (page - 1) * limit;
      const currentDate = new Date();
      const daysAgo = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Build where clause
      const where: any = {
        createdAt: {
          gte: startDate ? new Date(startDate) : daysAgo,
          lte: endDate ? new Date(endDate) : currentDate
        }
      };

      if (role) where.role = role;
      if (status) where.status = status;

      // Get users and total count
      const [users, total, totalUsers, newUsers, activeUsers, inactiveUsers] = await Promise.all([
        this.db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            profileCompleted: true,
            twoFactorEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        this.db.user.count({ where }),
        this.db.user.count(),
        this.db.user.count({
          where: {
            createdAt: {
              gte: new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
            }
          }
        }),
        this.db.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000))
            }
          }
        }),
        this.db.user.count({
          where: {
            lastLoginAt: null
          }
        })
      ]);

      // Get role and status statistics
      const [roleStats, statusStats] = await Promise.all([
        this.db.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        this.db.user.groupBy({
          by: ['status'],
          _count: { status: true }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      // Transform users data
      const transformedUsers = users.map(user => {
        const daysSinceRegistration = Math.floor(
          (currentDate.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          ...user,
          daysSinceRegistration,
          isNewUser: daysSinceRegistration <= 7,
          hasLoggedIn: user.lastLoginAt !== null,
          lastActivityAt: user.lastLoginAt
        };
      });

      // Build statistics
      const byRole = roleStats.reduce((acc, stat) => {
        acc[stat.role] = stat._count.role;
        return acc;
      }, {} as Record<string, number>);

      const byStatus = statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        users: transformedUsers,
        total,
        page,
        limit,
        totalPages,
        statistics: {
          totalUsers,
          newUsers,
          activeUsers,
          inactiveUsers,
          byRole,
          byStatus
        },
        timeRange: {
          startDate: startDate ? new Date(startDate) : daysAgo,
          endDate: endDate ? new Date(endDate) : currentDate,
          days
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to get recent users');
    }
  }

  async getRecentUsersStats(query: any): Promise<RecentUsersResponseDto> {
    try {
      const {
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        days = 7
      } = query;

      const skip = (page - 1) * limit;
      const currentDate = new Date();
      const last7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      const last30Days = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
      const daysAgo = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Build where clause for user filtering - only candidates
      const where: any = {
        createdAt: {
          gte: startDate ? new Date(startDate) : daysAgo,
          lte: endDate ? new Date(endDate) : currentDate
        },
        role: 'CANDIDATE' // Only include candidates, exclude admin and super admin
      };

      if (status) where.status = status;

      const [
        totalUsers,
        newUsers7Days,
        newUsers30Days,
        activeUsers7Days,
        activeUsers30Days,
        roleStats,
        statusStats,
        registrationTrends,
        users,
        total
      ] = await Promise.all([
        this.db.user.count({
          where: { role: 'CANDIDATE' }
        }),
        this.db.user.count({
          where: { 
            createdAt: { gte: last7Days },
            role: 'CANDIDATE'
          }
        }),
        this.db.user.count({
          where: { 
            createdAt: { gte: last30Days },
            role: 'CANDIDATE'
          }
        }),
        this.db.user.count({
          where: { 
            lastLoginAt: { gte: last7Days },
            role: 'CANDIDATE'
          }
        }),
        this.db.user.count({
          where: { 
            lastLoginAt: { gte: last30Days },
            role: 'CANDIDATE'
          }
        }),
        this.db.user.groupBy({
          by: ['role'],
          _count: { role: true },
          where: { role: 'CANDIDATE' }
        }),
        this.db.user.groupBy({
          by: ['status'],
          _count: { status: true },
          where: { role: 'CANDIDATE' }
        }),
        this.db.user.groupBy({
          by: ['createdAt'],
          _count: { createdAt: true },
          where: {
            createdAt: { gte: last30Days },
            role: 'CANDIDATE'
          }
        }),
        this.db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            profileCompleted: true,
            twoFactorEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        this.db.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      // Transform users data
      const transformedUsers = users.map(user => {
        const daysSinceRegistration = Math.floor(
          (currentDate.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return {
          ...user,
          daysSinceRegistration,
          isNewUser: daysSinceRegistration <= 7,
          hasLoggedIn: user.lastLoginAt !== null,
          lastActivityAt: user.lastLoginAt
        };
      });

      return {
        users: transformedUsers,
        total,
        page,
        limit,
        totalPages,
        statistics: {
          totalUsers,
          newUsers: newUsers7Days,
          activeUsers: activeUsers7Days,
          inactiveUsers: totalUsers - activeUsers7Days,
          byRole: roleStats.reduce((acc, stat) => {
            acc[stat.role] = stat._count.role;
            return acc;
          }, {} as Record<UserRole, number>),
          byStatus: statusStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {} as Record<UserStatus, number>)
        },
        timeRange: {
          startDate: startDate ? new Date(startDate) : daysAgo,
          endDate: endDate ? new Date(endDate) : currentDate,
          days
        }
      };
    } catch (error) {
      throw new BadRequestException('Failed to get recent users statistics');
    }
  }
}
