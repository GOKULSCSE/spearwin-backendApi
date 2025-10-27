import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CompanyRegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Company name is required' })
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  industry?: string;

  @IsOptional()
  @IsInt({ message: 'Founded year must be a number' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  foundedYear?: number;

  @IsOptional()
  @IsString({ message: 'Employee count must be a string' })
  employeeCount?: string;

  @IsOptional()
  @IsString({ message: 'Headquarters must be a string' })
  headquarters?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
  twitterUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Facebook URL must be a valid URL' })
  facebookUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is verified must be a boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isActive?: boolean;
}
