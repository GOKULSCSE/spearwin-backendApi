import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUrl,
  IsInt,
  IsDecimal,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CandidateRegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid date (YYYY-MM-DD format)' },
  )
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().split('T')[0] : undefined,
  )
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Current title must be a string' })
  currentTitle?: string;

  @IsOptional()
  @IsInt({ message: 'Experience years must be a number' })
  @Type(() => Number)
  experienceYears?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a valid number' })
  @Type(() => Number)
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'GitHub URL must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is available must be a boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isAvailable?: boolean;
}
