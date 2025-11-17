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
import { UserProfilesQueryDto } from './dto/user-profiles-query.dto';
import { UserProfilesListResponseDto, UserProfileDto } from './dto/user-profiles-response.dto';
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
  async create(createUserDto: CreateUserDto & { candidateData?: any }): Promise<any> {
    try {
      const { candidateData, password, ...userDataWithoutPassword } = createUserDto;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userData = {
        ...userDataWithoutPassword,
        password: hashedPassword,
      };
      
      // If candidate data is provided, create user and candidate in a transaction
      if (candidateData && userData.role === 'CANDIDATE') {
        return await this.db.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: userData,
          });

          // Create candidate profile
          if (candidateData) {
            const candidateProfileData: any = {
              userId: user.id,
              firstName: candidateData.firstName || '',
              lastName: candidateData.lastName || '',
              ...(candidateData.fatherName && { fatherName: candidateData.fatherName }),
              ...(candidateData.dateOfBirth && { dateOfBirth: new Date(candidateData.dateOfBirth) }),
              ...(candidateData.gender && { gender: candidateData.gender }),
              ...(candidateData.maritalStatus && { maritalStatus: candidateData.maritalStatus }),
              ...(candidateData.bio && { bio: candidateData.bio }),
              ...(candidateData.profileSummary && { profileSummary: candidateData.profileSummary }),
              ...(candidateData.currentTitle && { currentTitle: candidateData.currentTitle }),
              ...(candidateData.currentCompany && { currentCompany: candidateData.currentCompany }),
              ...(candidateData.currentLocation && { currentLocation: candidateData.currentLocation }),
              ...(candidateData.preferredLocation && { preferredLocation: candidateData.preferredLocation }),
              ...(candidateData.noticePeriod && { noticePeriod: candidateData.noticePeriod }),
              ...(candidateData.currentSalary && { currentSalary: candidateData.currentSalary }),
              ...(candidateData.expectedSalary && { expectedSalary: candidateData.expectedSalary }),
              ...(candidateData.profileType && { profileType: candidateData.profileType }),
              ...(candidateData.experienceYears && { experienceYears: candidateData.experienceYears }),
              ...(candidateData.cityName && { cityName: candidateData.cityName }),
              ...(candidateData.country && { country: candidateData.country }),
              ...(candidateData.state && { state: candidateData.state }),
              ...(candidateData.streetAddress && { address: candidateData.streetAddress, streetAddress: candidateData.streetAddress }),
              ...(candidateData.mobileNumber && { mobileNumber: candidateData.mobileNumber }),
              ...(candidateData.jobExperience && { jobExperience: candidateData.jobExperience }),
              ...(candidateData.profilePicture && { profilePicture: candidateData.profilePicture }),
            };

            const candidate = await tx.candidate.create({
              data: candidateProfileData,
            });

            // Create Resume record if cvResume URL is provided
            if (candidateData.cvResume) {
              try {
                // Extract filename from URL
                const urlParts = candidateData.cvResume.split('/');
                const fileName = urlParts[urlParts.length - 1] || 'resume.pdf';
                
                // Determine file size and mime type from URL/file extension
                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const mimeTypeMap: { [key: string]: string } = {
                  'pdf': 'application/pdf',
                  'doc': 'application/msword',
                  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                };
                const mimeType = mimeTypeMap[fileExtension] || 'application/pdf';

                await tx.resume.create({
                  data: {
                    candidateId: candidate.id,
                    title: 'Resume',
                    fileName: fileName,
                    filePath: candidateData.cvResume,
                    fileSize: 0, // Size unknown from URL, set to 0
                    mimeType: mimeType,
                    isDefault: true, // Set as default resume
                  },
                });
              } catch (resumeError) {
                // Log error but don't fail the entire user creation
                console.error('Failed to create resume record:', resumeError);
              }
            }
          }

          // Return user with candidate data
          return await tx.user.findUnique({
            where: { id: user.id },
            include: {
              candidate: true,
            },
          });
        });
      }

      // Otherwise, just create the user (password already hashed)
      return await this.db.user.create({ data: userData });
    } catch (error) {
      // Handle Prisma-specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const field = error.meta?.target as string[];
          const fieldName = field?.[0] || 'field';
          throw new BadRequestException(
            `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is already in use`,
          );
        }
        if (error.code === 'P2003') {
          // Foreign key constraint violation
          throw new BadRequestException('Invalid reference: related record does not exist');
        }
        if (error.code === 'P2011') {
          // Null constraint violation
          throw new BadRequestException('Required field is missing');
        }
      }
      
      // Log the actual error for debugging
      console.error('User creation error:', error);
      
      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      
      // For unknown errors, provide a more helpful message
      throw new InternalServerErrorException(
        error?.message || 'Failed to create user. Please check your input data.',
      );
    }
  }

  async findAll() {
    try {
      const data = await this.db.user.findMany({
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return data;
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Get user by ID with all related data
   * Returns user with candidate, admin, superAdmin, or company profile data
   * Includes all profile fields: email, phone, bio, profileImage, address fields, social links
   */
  async findOne(userId: string) {
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
              // Include all candidate relations: skills, education, experience, resumes
              skills: true,
              education: true,
              experience: true,
              resumes: true,
            },
          },
          // Include all admin fields (email, phone, bio, profileImage, country, state, city, streetAddress, social links)
          admin: true,
          // Include all superAdmin fields (email, phone, bio, profileImage, country, state, city, streetAddress, social links)
          superAdmin: true,
          company: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Return user with all profile fields included
      // Admin and SuperAdmin models now include: email, phone, bio, profileImage, 
      // country, state, city, streetAddress, linkedinUrl, facebookUrl, twitterUrl, instagramUrl
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  // Update user with candidate profile (for admin)
  async updateUserWithProfile(
    userId: string,
    updateDto: any,
  ): Promise<any> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        include: { candidate: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { candidateData, ...userData } = updateDto;

      // Update user and candidate in a transaction
      return await this.db.$transaction(async (tx) => {
        // Update user data
        const userUpdateData: any = {};
        if (userData.email) userUpdateData.email = userData.email;
        if (userData.phone) userUpdateData.phone = userData.phone;
        if (userData.emailVerified !== undefined) userUpdateData.emailVerified = userData.emailVerified;
        if (userData.phoneVerified !== undefined) userUpdateData.phoneVerified = userData.phoneVerified;

        // Check email uniqueness if changing
        if (userData.email && userData.email !== user.email) {
          const existingUser = await tx.user.findUnique({
            where: { email: userData.email },
          });
          if (existingUser) {
            throw new BadRequestException('Email is already in use');
          }
          userUpdateData.emailVerified = userData.emailVerified ?? false;
        }

        // Check phone uniqueness if changing
        if (userData.phone && userData.phone !== user.phone) {
          const existingUser = await tx.user.findUnique({
            where: { phone: userData.phone },
          });
          if (existingUser) {
            throw new BadRequestException('Phone number is already in use');
          }
          userUpdateData.phoneVerified = userData.phoneVerified ?? false;
        }

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data: userUpdateData,
          });
        }

        // Update candidate profile if candidate data is provided
        if (candidateData && user.candidate) {
          const candidateUpdateData: any = {};
          
          if (candidateData.firstName !== undefined) candidateUpdateData.firstName = candidateData.firstName;
          if (candidateData.lastName !== undefined) candidateUpdateData.lastName = candidateData.lastName;
          if (candidateData.fatherName !== undefined) candidateUpdateData.fatherName = candidateData.fatherName;
          if (candidateData.dateOfBirth !== undefined) candidateUpdateData.dateOfBirth = candidateData.dateOfBirth ? new Date(candidateData.dateOfBirth) : null;
          if (candidateData.gender !== undefined) candidateUpdateData.gender = candidateData.gender;
          if (candidateData.maritalStatus !== undefined) candidateUpdateData.maritalStatus = candidateData.maritalStatus;
          if (candidateData.bio !== undefined) candidateUpdateData.bio = candidateData.bio;
          if (candidateData.profileSummary !== undefined) candidateUpdateData.bio = candidateData.profileSummary;
          if (candidateData.currentTitle !== undefined) candidateUpdateData.currentTitle = candidateData.currentTitle;
          if (candidateData.currentCompany !== undefined) candidateUpdateData.currentCompany = candidateData.currentCompany;
          if (candidateData.currentLocation !== undefined) candidateUpdateData.currentLocation = candidateData.currentLocation;
          if (candidateData.preferredLocation !== undefined) candidateUpdateData.preferredLocation = candidateData.preferredLocation;
          if (candidateData.noticePeriod !== undefined) candidateUpdateData.noticePeriod = candidateData.noticePeriod;
          if (candidateData.currentSalary !== undefined) candidateUpdateData.currentSalary = candidateData.currentSalary;
          if (candidateData.expectedSalary !== undefined) candidateUpdateData.expectedSalary = candidateData.expectedSalary;
          if (candidateData.profileType !== undefined) candidateUpdateData.profileType = candidateData.profileType;
          if (candidateData.experienceYears !== undefined) candidateUpdateData.experienceYears = candidateData.experienceYears;
          if (candidateData.cityName !== undefined) candidateUpdateData.cityName = candidateData.cityName;
          if (candidateData.country !== undefined) candidateUpdateData.country = candidateData.country;
          if (candidateData.state !== undefined) candidateUpdateData.state = candidateData.state;
          if (candidateData.streetAddress !== undefined) {
            candidateUpdateData.address = candidateData.streetAddress;
            candidateUpdateData.streetAddress = candidateData.streetAddress;
          }
          if (candidateData.mobileNumber !== undefined) candidateUpdateData.mobileNumber = candidateData.mobileNumber;
          if (candidateData.jobExperience !== undefined) candidateUpdateData.jobExperience = candidateData.jobExperience;

          await tx.candidate.update({
            where: { id: user.candidate.id },
            data: candidateUpdateData,
          });
        } else if (candidateData && !user.candidate && user.role === 'CANDIDATE') {
          // Create candidate if it doesn't exist
          const candidateCreateData: any = {
            userId: user.id,
            firstName: candidateData.firstName || '',
            lastName: candidateData.lastName || '',
            ...(candidateData.fatherName && { fatherName: candidateData.fatherName }),
            ...(candidateData.dateOfBirth && { dateOfBirth: new Date(candidateData.dateOfBirth) }),
            ...(candidateData.gender && { gender: candidateData.gender }),
            ...(candidateData.maritalStatus && { maritalStatus: candidateData.maritalStatus }),
            ...(candidateData.bio && { bio: candidateData.bio }),
            ...(candidateData.profileSummary && { bio: candidateData.profileSummary }),
            ...(candidateData.currentTitle && { currentTitle: candidateData.currentTitle }),
            ...(candidateData.currentCompany && { currentCompany: candidateData.currentCompany }),
            ...(candidateData.currentLocation && { currentLocation: candidateData.currentLocation }),
            ...(candidateData.preferredLocation && { preferredLocation: candidateData.preferredLocation }),
            ...(candidateData.noticePeriod && { noticePeriod: candidateData.noticePeriod }),
            ...(candidateData.currentSalary && { currentSalary: candidateData.currentSalary }),
            ...(candidateData.expectedSalary && { expectedSalary: candidateData.expectedSalary }),
            ...(candidateData.profileType && { profileType: candidateData.profileType }),
            ...(candidateData.experienceYears && { experienceYears: candidateData.experienceYears }),
            ...(candidateData.cityName && { cityName: candidateData.cityName }),
            ...(candidateData.country && { country: candidateData.country }),
            ...(candidateData.state && { state: candidateData.state }),
            ...(candidateData.streetAddress && { address: candidateData.streetAddress, streetAddress: candidateData.streetAddress }),
            ...(candidateData.mobileNumber && { mobileNumber: candidateData.mobileNumber }),
            ...(candidateData.jobExperience && { jobExperience: candidateData.jobExperience }),
          };

          await tx.candidate.create({
            data: candidateCreateData,
          });
        }

        // Return updated user with candidate
        return await tx.user.findUnique({
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
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
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
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target as string[];
        const fieldName = field?.[0] || 'field';
        throw new BadRequestException(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is already in use`,
        );
      }
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference: related record does not exist');
      }
      if (error.code === 'P2011') {
        // Null constraint violation
        throw new BadRequestException('Required field is missing');
      }
    }
    
    // Log the actual error for debugging
    console.error('User service error:', error);
    
    // Re-throw known exceptions
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    }
    
    // For unknown errors, provide a more helpful message
    throw new InternalServerErrorException(
      error?.message || "Can't fetch user Details",
    );
  }

  // =================================================================
  // USER PROFILES MANAGEMENT API
  // =================================================================

  async getUserProfiles(query: UserProfilesQueryDto): Promise<UserProfilesListResponseDto> {
    try {
      const {
        search,
        role,
        status,
        emailVerified,
        phoneVerified,
        profileCompleted,
        twoFactorEnabled,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          {
            candidate: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (status) {
        where.status = status;
      }

      if (emailVerified !== undefined) {
        where.emailVerified = emailVerified;
      }

      if (phoneVerified !== undefined) {
        where.phoneVerified = phoneVerified;
      }

      if (profileCompleted !== undefined) {
        where.profileCompleted = profileCompleted;
      }

      if (twoFactorEnabled !== undefined) {
        where.twoFactorEnabled = twoFactorEnabled;
      }

      // Build order by clause
      const orderBy: Prisma.UserOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.UserOrderByWithRelationInput] = sortOrder;

      // Get users and total count
      const [users, total] = await Promise.all([
        this.db.user.findMany({
          where,
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
                resumes: {
                  select: {
                    id: true,
                    title: true,
                    fileName: true,
                    filePath: true,
                    fileSize: true,
                    mimeType: true,
                    isDefault: true,
                    uploadedAt: true,
                  },
                  orderBy: {
                    uploadedAt: 'desc',
                  },
                },
              },
            },
            admin: true,
            superAdmin: true,
            company: {
              select: {
                id: true,
                name: true,
                isVerified: true,
                isActive: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.db.user.count({ where }),
      ]);

      // Get statistics
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        roleStats,
        statusStats,
      ] = await Promise.all([
        this.db.user.count(),
        this.db.user.count({ where: { status: 'ACTIVE' } }),
        this.db.user.count({ where: { status: 'INACTIVE' } }),
        this.db.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
        this.db.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
        this.db.user.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Transform users data
      const transformedUsers: UserProfileDto[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profileCompleted: user.profileCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        candidate: user.candidate
          ? {
              id: user.candidate.id,
              firstName: user.candidate.firstName,
              lastName: user.candidate.lastName,
              city: user.candidate.city
                ? {
                    id: user.candidate.city.id,
                    name: user.candidate.city.name,
                    state: user.candidate.city.state
                      ? {
                          id: user.candidate.city.state.id,
                          name: user.candidate.city.state.name,
                          country: user.candidate.city.state.country
                            ? {
                                id: user.candidate.city.state.country.id,
                                name: user.candidate.city.state.country.name,
                                iso2: user.candidate.city.state.country.iso2,
                              }
                            : undefined,
                        }
                      : undefined,
                  }
                : undefined,
              resumes: user.candidate.resumes || [],
            }
          : undefined,
        admin: user.admin
          ? {
              id: user.admin.id,
              permissions: user.admin.permissions,
            }
          : undefined,
        superAdmin: user.superAdmin
          ? {
              id: user.superAdmin.id,
              permissions: user.superAdmin.permissions,
            }
          : undefined,
        company: user.company
          ? {
              id: user.company.id,
              name: user.company.name,
              isVerified: user.company.isVerified,
              isActive: user.company.isActive,
            }
          : undefined,
      }));

      // Build statistics
      const byRole = roleStats.reduce((acc, stat) => {
        acc[stat.role] = stat._count.role;
        return acc;
      }, {} as Record<UserRole, number>);

      const byStatus = statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<UserStatus, number>);

      return {
        users: transformedUsers,
        total,
        page,
        limit,
        totalPages,
        statistics: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          pendingUsers,
          byRole,
          byStatus,
        },
      };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  // =================================================================
  // USER STATUS SPECIFIC ENDPOINTS
  // =================================================================

  async updateUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<UserProfileResponseDto> {
    try {
      const user = await this.db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user status
      const updatedUser = await this.db.user.update({
        where: { id: userId },
        data: { status },
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

      // Log the status update
      await this.logActivity(
        userId,
        LogAction.UPDATE,
        LogLevel.INFO,
        'User',
        userId,
        `User status updated to ${status}`,
      );

      return updatedUser as unknown as UserProfileResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleException(error);
      throw error;
    }
  }

  async getActiveUsers(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ users: any[] }> {
    try {
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const users = await this.db.user.findMany({
        where: { status: 'ACTIVE' },
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
          company: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              isActive: true,
            },
          },
        },
        orderBy,
      });

      return { users };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getPendingUsers(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ users: any[] }> {
    try {
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const users = await this.db.user.findMany({
        where: { status: 'PENDING_VERIFICATION' },
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
          company: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              isActive: true,
            },
          },
        },
        orderBy,
      });

      return { users };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
  }

  async getInactiveUsers(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ users: any[] }> {
    try {
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const users = await this.db.user.findMany({
        where: { status: 'INACTIVE' },
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
          company: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              isActive: true,
            },
          },
        },
        orderBy,
      });

      return { users };
    } catch (error) {
      this.handleException(error);
      throw error;
    }
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
