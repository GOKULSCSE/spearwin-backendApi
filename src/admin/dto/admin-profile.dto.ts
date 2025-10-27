import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  designation?: string;
}

export interface AdminProfileResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string; // Made optional since it might not always be present
  phone?: string | null; // Allow null values
  role?: string; // Made optional since it might not always be present
  department?: string | null; // Allow null values
  designation?: string | null; // Allow null values
  permissions: any; // Changed from string[] to any to handle JsonValue
  user?: any; // Allow user object
  createdAt: Date;
  updatedAt: Date;
}