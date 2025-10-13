import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class AdminListQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  department?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role filter' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid status filter' })
  status?: UserStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AdminListResponseDto {
  admins: AdminProfileResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminProfileResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  designation?: string | null;
  permissions?: any;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    phone?: string | null;
    phoneVerified: boolean;
    role: string;
    status: string;
    profileCompleted: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
