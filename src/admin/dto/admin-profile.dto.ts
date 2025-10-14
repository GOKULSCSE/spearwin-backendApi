import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @MaxLength(100, { message: 'Department must not exceed 100 characters' })
  department?: string;

  @IsOptional()
  @IsString({ message: 'Designation must be a string' })
  @MaxLength(100, { message: 'Designation must not exceed 100 characters' })
  designation?: string;
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
