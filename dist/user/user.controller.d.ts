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
        phone: string | null;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        phoneVerified: boolean;
        twoFactorEnabled: boolean;
        id: string;
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    findAll(): Promise<{
        email: string;
        phone: string | null;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        phoneVerified: boolean;
        twoFactorEnabled: boolean;
        id: string;
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        profileCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
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
