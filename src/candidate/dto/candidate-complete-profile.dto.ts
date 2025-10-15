import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsEmail,
  Min,
  Max,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCandidateCompleteProfileDto {
  // Account Information
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  // Personal Information
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Father name must be a string' })
  @Transform(({ value }) => value?.trim())
  fatherName?: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Marital status must be a string' })
  maritalStatus?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  // Career Information
  @IsOptional()
  @IsString({ message: 'Job experience must be a string' })
  jobExperience?: string;

  @IsOptional()
  @IsString({ message: 'Current company must be a string' })
  @Transform(({ value }) => value?.trim())
  currentCompany?: string;

  @IsOptional()
  @IsString({ message: 'Current location must be a string' })
  @Transform(({ value }) => value?.trim())
  currentLocation?: string;

  @IsOptional()
  @IsString({ message: 'Preferred location must be a string' })
  @Transform(({ value }) => value?.trim())
  preferredLocation?: string;

  @IsOptional()
  @IsString({ message: 'Notice period must be a string' })
  noticePeriod?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Current salary must be a number' })
  @Min(0, { message: 'Current salary must be at least 0' })
  currentSalary?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  @Min(0, { message: 'Expected salary must be at least 0' })
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'Profile type must be a string' })
  profileType?: string;

  // Additional Information
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
  @IsString({ message: 'Street address must be a string' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString({ message: 'Profile summary must be a string' })
  @Transform(({ value }) => value?.trim())
  bio?: string;

  // Professional URLs
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'GitHub URL must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string;

  // Profile Picture
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  profilePicture?: string;
}

export class CandidateCompleteProfileResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: string;
  profilePicture?: string;
  bio?: string;
  currentTitle?: string;
  currentCompany?: string;
  currentLocation?: string;
  preferredLocation?: string;
  noticePeriod?: string;
  currentSalary?: number;
  expectedSalary?: number;
  profileType?: string;
  experienceYears?: number;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    email: string;
    phone?: string | null;
  };
  city?: {
    id: string;
    name: string;
    state: {
      id: string;
      name: string;
      country: {
        id: string;
        name: string;
        code: string;
      };
    };
  } | null;
  skills?: Array<{
    id: string;
    skillName: string;
    level?: string;
    yearsUsed?: number;
  }>;
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    level: string;
    startDate: Date;
    endDate?: Date;
    isCompleted: boolean;
    grade?: string;
    description?: string;
  }>;
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    location?: string;
    achievements?: string;
  }>;
  resumes?: Array<{
    id: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    isDefault: boolean;
    uploadedAt: Date;
  }>;
}
