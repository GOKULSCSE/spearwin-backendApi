import { UserService } from './user.service';
import { CreateUserWithProfileDto } from './dto/create-user-with-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserWithProfileDto } from './dto/update-user-with-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
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
    create(createUserDto: CreateUserWithProfileDto): Promise<any>;
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
    getCurrentUserProfile(user: CurrentUser): Promise<UserProfileResponseDto>;
    updateCurrentUserProfile(user: CurrentUser, updateProfileDto: UpdateProfileDto): Promise<UserProfileResponseDto>;
    getUserActivityLogs(user: CurrentUser, query: ActivityLogsQueryDto): Promise<ActivityLogsResponseDto>;
    getNotificationPreferences(user: CurrentUser): Promise<NotificationPreferencesResponseDto>;
    updateNotificationPreferences(user: CurrentUser, updatePreferencesDto: UpdateNotificationPreferencesDto): Promise<NotificationPreferencesResponseDto>;
    testNotificationSettings(user: CurrentUser): Promise<{
        message: string;
    }>;
    deleteUserAccount(user: CurrentUser): Promise<{
        message: string;
    }>;
    changePassword(user: CurrentUser, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getUserProfiles(user: CurrentUser, query: UserProfilesQueryDto): Promise<UserProfilesListResponseDto>;
    getRecentUsers(user: CurrentUser, query: RecentUsersQueryDto): Promise<RecentUsersResponseDto>;
    getRecentUsersStats(user: CurrentUser, query: RecentUsersStatsQueryDto): Promise<RecentUsersResponseDto>;
    findOne(userId: string): Promise<{
        candidate: ({
            city: ({
                state: {
                    country: {
                        createdAt: Date;
                        name: string;
                        id: number;
                        updatedAt: Date;
                        isActive: boolean;
                        latitude: string | null;
                        longitude: string | null;
                        iso2: string | null;
                        capital: string | null;
                        currency: string | null;
                        currency_name: string | null;
                        currency_symbol: string | null;
                        iso3: string | null;
                        nationality: string | null;
                        native: string | null;
                        numeric_code: string | null;
                        phonecode: string | null;
                        region: string | null;
                        region_id: number | null;
                        subregion: string | null;
                        subregion_id: number | null;
                        tld: string | null;
                    } | null;
                } & {
                    level: string | null;
                    type: string | null;
                    createdAt: Date;
                    name: string | null;
                    id: number;
                    updatedAt: Date;
                    isActive: boolean;
                    country_code: string | null;
                    country_id: number | null;
                    country_name: string | null;
                    latitude: string | null;
                    longitude: string | null;
                    fips_code: string | null;
                    iso2: string | null;
                    parent_id: number | null;
                };
            } & {
                createdAt: Date;
                name: string;
                id: number;
                updatedAt: Date;
                isActive: boolean;
                country_code: string | null;
                country_id: number | null;
                country_name: string | null;
                latitude: string | null;
                longitude: string | null;
                state_code: string | null;
                state_id: number;
                state_name: string | null;
                wikiDataId: string | null;
            }) | null;
            education: {
                level: import("@prisma/client").$Enums.EducationLevel;
                startDate: Date;
                endDate: Date | null;
                createdAt: Date;
                id: string;
                description: string | null;
                candidateId: string;
                institution: string;
                degree: string;
                fieldOfStudy: string | null;
                isCompleted: boolean;
                grade: string | null;
            }[];
            experience: {
                startDate: Date;
                endDate: Date | null;
                createdAt: Date;
                company: string;
                id: string;
                description: string | null;
                candidateId: string;
                position: string;
                isCurrent: boolean;
                location: string | null;
                achievements: string | null;
            }[];
            skills: {
                level: string | null;
                id: string;
                candidateId: string;
                skillName: string;
                yearsUsed: number | null;
            }[];
            resumes: {
                id: string;
                updatedAt: Date;
                title: string;
                candidateId: string;
                fileName: string;
                filePath: string;
                fileSize: number;
                mimeType: string;
                isDefault: boolean;
                uploadedAt: Date;
            }[];
        } & {
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            country: string | null;
            state: string | null;
            id: string;
            updatedAt: Date;
            userId: string;
            dateOfBirth: Date | null;
            gender: string | null;
            profilePicture: string | null;
            bio: string | null;
            currentTitle: string | null;
            experienceYears: number | null;
            expectedSalary: import("@prisma/client/runtime/library").Decimal | null;
            address: string | null;
            linkedinUrl: string | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            isAvailable: boolean;
            cityName: string | null;
            currentCompany: string | null;
            currentLocation: string | null;
            currentSalary: import("@prisma/client/runtime/library").Decimal | null;
            fatherName: string | null;
            jobExperience: string | null;
            maritalStatus: string | null;
            mobileNumber: string | null;
            noticePeriod: string | null;
            preferredLocation: string | null;
            profileSummary: string | null;
            profileType: string | null;
            streetAddress: string | null;
            cityId: number | null;
        }) | null;
        admin: {
            firstName: string;
            lastName: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
            designation: string | null;
            department: string | null;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        superAdmin: {
            firstName: string;
            lastName: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            userId: string;
            permissions: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        company: {
            createdAt: Date;
            country: string | null;
            state: string | null;
            city: string | null;
            name: string;
            id: string;
            updatedAt: Date;
            userId: string | null;
            address: string | null;
            linkedinUrl: string | null;
            description: string | null;
            slug: string;
            website: string | null;
            logo: string | null;
            industry: string | null;
            foundedYear: number | null;
            employeeCount: string | null;
            headquarters: string | null;
            twitterUrl: string | null;
            facebookUrl: string | null;
            isVerified: boolean;
            isActive: boolean;
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
    }>;
    update(id: string, updateUserDto: UpdateUserDto): string;
    updateUserProfile(userId: string, updateDto: UpdateUserWithProfileDto, currentUser: CurrentUser): Promise<any>;
    updateUserStatus(userId: string, updateStatusDto: UpdateUserStatusDto, user: CurrentUser): Promise<UserProfileResponseDto>;
    remove(id: string): string;
}
