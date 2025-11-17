import { UserRole, UserStatus } from '@prisma/client';

export interface UserProfileDto {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    city?: {
      id: number;
      name: string;
      state?: {
        id: number;
        name: string | null;
        country?: {
          id: number;
          name: string;
          iso2: string | null;
        };
      };
    };
    resumes?: Array<{
      id: string;
      title: string;
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      isDefault: boolean;
      uploadedAt: Date;
    }>;
  };
  admin?: {
    id: string;
    permissions: any;
  };
  superAdmin?: {
    id: string;
    permissions: any;
  };
  company?: {
    id: string;
    name: string;
    isVerified: boolean;
    isActive: boolean;
  };
}

export interface UserProfilesListResponseDto {
  users: UserProfileDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statistics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingUsers: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  };
}
