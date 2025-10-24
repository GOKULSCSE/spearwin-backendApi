import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCandidateProfileDto {
  // Basic Information
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

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
  @IsString({ message: 'Father name must be a string' })
  @MaxLength(100, { message: 'Father name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  fatherName?: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Please provide a valid phone number' })
  mobileNumber?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
  gender?: string;

  @IsOptional()
  @IsEnum(['Single', 'Married', 'Divorced', 'Widowed'], { 
    message: 'Marital status must be Single, Married, Divorced, or Widowed' 
  })
  maritalStatus?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  // Career Information
  @IsOptional()
  @IsString({ message: 'Job experience must be a string' })
  @MaxLength(100, { message: 'Job experience must not exceed 100 characters' })
  jobExperience?: string;

  @IsOptional()
  @IsString({ message: 'Current company must be a string' })
  @MaxLength(100, { message: 'Current company must not exceed 100 characters' })
  currentCompany?: string;

  @IsOptional()
  @IsString({ message: 'Current location must be a string' })
  @MaxLength(200, { message: 'Current location must not exceed 200 characters' })
  currentLocation?: string;

  @IsOptional()
  @IsString({ message: 'Preferred location must be a string' })
  @MaxLength(200, { message: 'Preferred location must not exceed 200 characters' })
  preferredLocation?: string;

  @IsOptional()
  @IsString({ message: 'Notice period must be a string' })
  @MaxLength(50, { message: 'Notice period must not exceed 50 characters' })
  noticePeriod?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Current salary must be a number' })
  currentSalary?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  expectedSalary?: number;

  @IsOptional()
  @IsEnum(['Fresher', 'Experienced'], { message: 'Profile type must be Fresher or Experienced' })
  profileType?: string;

  // Location Information
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State must not exceed 100 characters' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'City name must be a string' })
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  cityName?: string;

  @IsOptional()
  @IsString({ message: 'Street address must be a string' })
  @MaxLength(500, { message: 'Street address must not exceed 500 characters' })
  streetAddress?: string;

  // Profile Content
  @IsOptional()
  @IsString({ message: 'Profile summary must be a string' })
  @MaxLength(2000, { message: 'Profile summary must not exceed 2000 characters' })
  profileSummary?: string;

  // Social Links
  @IsOptional()
  @IsString({ message: 'LinkedIn URL must be a string' })
  @MaxLength(500, { message: 'LinkedIn URL must not exceed 500 characters' })
  linkedinUrl?: string;

  @IsOptional()
  @IsString({ message: 'GitHub URL must be a string' })
  @MaxLength(500, { message: 'GitHub URL must not exceed 500 characters' })
  githubUrl?: string;

  @IsOptional()
  @IsString({ message: 'Portfolio URL must be a string' })
  @MaxLength(500, { message: 'Portfolio URL must not exceed 500 characters' })
  portfolioUrl?: string;

  // Availability
  @IsOptional()
  @IsBoolean({ message: 'Is available must be a boolean' })
  isAvailable?: boolean;

  // File URLs (will be set after file upload)
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  profilePicture?: string;

  @IsOptional()
  @IsString({ message: 'CV must be a string' })
  cv?: string;
}
