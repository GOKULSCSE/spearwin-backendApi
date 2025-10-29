import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import { UpdateNotificationPreferencesDto, NotificationPreferencesResponseDto } from './dto/notification-preferences.dto';
import { RecentUsersQueryDto } from './dto/recent-users-query.dto';
import { RecentUsersStatsQueryDto } from './dto/recent-users-stats-query.dto';
import { UserProfilesQueryDto } from './dto/user-profiles-query.dto';
import type { UserProfileResponseDto } from './dto/user-profile-response.dto';
import type { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
import type { RecentUsersResponseDto } from './dto/recent-users-response.dto';
import type { UserProfilesListResponseDto } from './dto/user-profiles-response.dto';
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
        status: import("@prisma/client").$Enums.UserStatus;
        profileCompleted: boolean;
        createdAt: Date;
        id: string;
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        updatedAt: Date;
    } | undefined>;
    findAll(): Promise<({
        candidate: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        email: string;
        phone: string | null;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        phoneVerified: boolean;
        twoFactorEnabled: boolean;
        status: import("@prisma/client").$Enums.UserStatus;
        profileCompleted: boolean;
        createdAt: Date;
        id: string;
        emailVerifiedAt: Date | null;
        phoneVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        updatedAt: Date;
    })[] | undefined>;
    getActiveUsers(sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        users: any[];
    }>;
    getPendingUsers(sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        users: any[];
    }>;
    getInactiveUsers(sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        users: any[];
    }>;
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
    getUserProfiles(user: CurrentUser, query: UserProfilesQueryDto): Promise<UserProfilesListResponseDto>;
    getRecentUsers(user: CurrentUser, query: RecentUsersQueryDto): Promise<RecentUsersResponseDto>;
    getRecentUsersStats(user: CurrentUser, query: RecentUsersStatsQueryDto): Promise<RecentUsersResponseDto>;
}
