import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import { UpdateNotificationPreferencesDto, NotificationPreferencesResponseDto } from './dto/notification-preferences.dto';
import type { UserProfileResponseDto } from './dto/user-profile-response.dto';
import type { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
import { type CurrentUser } from '../auth/decorators/current-user.decorator';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        password: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        phone: string | null;
        phoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        profileCompleted: boolean;
        twoFactorEnabled: boolean;
    } | undefined>;
    findAll(): Promise<{
        email: string;
        password: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        emailVerifiedAt: Date | null;
        phone: string | null;
        phoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        role: import("@prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        profileCompleted: boolean;
        twoFactorEnabled: boolean;
    }[] | undefined>;
    findOne(id: string): string;
    update(id: string, updateUserDto: UpdateUserDto): string;
    remove(id: string): string;
    getCurrentUserProfile(user: CurrentUser): Promise<UserProfileResponseDto>;
    updateCurrentUserProfile(user: CurrentUser, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponseDto>;
    deleteUserAccount(user: CurrentUser): Promise<{
        message: string;
    }>;
    changePassword(user: CurrentUser, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getUserActivityLogs(user: CurrentUser, query: ActivityLogsQueryDto): Promise<ActivityLogsResponseDto>;
    getNotificationPreferences(user: CurrentUser): Promise<NotificationPreferencesResponseDto>;
    updateNotificationPreferences(user: CurrentUser, updatePreferencesDto: UpdateNotificationPreferencesDto): Promise<NotificationPreferencesResponseDto>;
    testNotificationSettings(user: CurrentUser): Promise<{
        message: string;
    }>;
}
