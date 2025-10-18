import { UserRole, UserStatus } from '@prisma/client';

export class AdminAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    firstName: string;
    lastName: string;
    designation?: string;
    department?: string;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
}

export class AdminLoginResponseDto {
  success: boolean;
  message: string;
  data: AdminAuthResponseDto;
}
