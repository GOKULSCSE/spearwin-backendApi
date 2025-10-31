import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsStrongPassword,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Define UserRole enum locally to avoid import issues
export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY = 'COMPANY',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

  @IsEnum(Object.values(UserRole), {
    message: 'Role must be one of: CANDIDATE, ADMIN, SUPER_ADMIN, COMPANY',
  })
  role: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Phone verified must be a boolean value' })
  phoneVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Two factor enabled must be a boolean value' })
  twoFactorEnabled?: boolean;
}
