import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

export class UserProfilesQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role filter' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Invalid status filter' })
  status?: UserStatus;

  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Phone verified must be a boolean value' })
  phoneVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Profile completed must be a boolean value' })
  profileCompleted?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Two factor enabled must be a boolean value' })
  twoFactorEnabled?: boolean;

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

