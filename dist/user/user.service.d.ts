import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogsQueryDto } from './dto/activity-logs-query.dto';
import { UpdateNotificationPreferencesDto, NotificationPreferencesResponseDto } from './dto/notification-preferences.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { ActivityLogsResponseDto } from './dto/activity-logs-response.dto';
import { DatabaseService } from 'src/database/database.service';
export declare class UserService {
    private readonly db;
    constructor(db: DatabaseService);
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
    findOne(id: number): string;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
    getCurrentUserProfile(userId: string): Promise<UserProfileResponseDto>;
    updateCurrentUserProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponseDto>;
    deleteUserAccount(userId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getUserActivityLogs(userId: string, query: ActivityLogsQueryDto): Promise<ActivityLogsResponseDto>;
    getNotificationPreferences(userId: string): Promise<NotificationPreferencesResponseDto>;
    updateNotificationPreferences(userId: string, updatePreferencesDto: UpdateNotificationPreferencesDto): Promise<NotificationPreferencesResponseDto>;
    testNotificationSettings(userId: string): Promise<{
        message: string;
    }>;
    private logActivity;
    handleException(error: any): void;
}
