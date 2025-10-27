import { IsOptional, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class RecentUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role filter' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid status filter' })
  status?: UserStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Days must be a number' })
  @Min(1, { message: 'Days must be at least 1' })
  @Max(365, { message: 'Days must not exceed 365' })
  days?: number = 7; // Default to last 7 days
}
