import { UserRole, UserStatus } from '@prisma/client';

export class RecentUserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields for recent users
  daysSinceRegistration: number;
  isNewUser: boolean; // Registered in last 7 days
  hasLoggedIn: boolean;
  lastActivityAt: Date | null;
}

export class RecentUsersResponseDto {
  users: RecentUserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  
  // Statistics
  statistics: {
    totalUsers: number;
    newUsers: number; // Registered in specified days
    activeUsers: number; // Users who logged in recently
    inactiveUsers: number; // Users who never logged in
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  };
  
  // Time range info
  timeRange: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
}
