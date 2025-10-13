import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJobDto {
  @IsString({ message: 'Title must be a string' })
  @Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @Length(10, 5000, { message: 'Description must be between 10 and 5000 characters' })
  description: string;

  @IsOptional()
  @IsString({ message: 'Requirements must be a string' })
  @Length(10, 2000, { message: 'Requirements must be between 10 and 2000 characters' })
  requirements?: string;

  @IsOptional()
  @IsString({ message: 'Responsibilities must be a string' })
  @Length(10, 2000, { message: 'Responsibilities must be between 10 and 2000 characters' })
  responsibilities?: string;

  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  @Length(10, 1000, { message: 'Benefits must be between 10 and 1000 characters' })
  benefits?: string;

  @IsString({ message: 'Company ID must be a string' })
  companyId: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'], {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE'
  })
  jobType: string;

  @IsEnum(['REMOTE', 'ONSITE', 'HYBRID'], {
    message: 'Work mode must be one of: REMOTE, ONSITE, HYBRID'
  })
  workMode: string;

  @IsEnum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'], {
    message: 'Experience level must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE'
  })
  experienceLevel: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum experience must be a number' })
  @Min(0, { message: 'Minimum experience must be positive' })
  minExperience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum experience must be a number' })
  @Min(0, { message: 'Maximum experience must be positive' })
  maxExperience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be positive' })
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be positive' })
  maxSalary?: number;

  @IsOptional()
  @IsBoolean({ message: 'Salary negotiable must be a boolean' })
  salaryNegotiable?: boolean;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skillsRequired?: string[];

  @IsOptional()
  @IsEnum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL'], {
    message: 'Education level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL'
  })
  educationLevel?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date' })
  expiresAt?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'], {
    message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED, ARCHIVED'
  })
  status?: string = 'DRAFT';
}

export class UpdateJobDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(10, 5000, { message: 'Description must be between 10 and 5000 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Requirements must be a string' })
  @Length(10, 2000, { message: 'Requirements must be between 10 and 2000 characters' })
  requirements?: string;

  @IsOptional()
  @IsString({ message: 'Responsibilities must be a string' })
  @Length(10, 2000, { message: 'Responsibilities must be between 10 and 2000 characters' })
  responsibilities?: string;

  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  @Length(10, 1000, { message: 'Benefits must be between 10 and 1000 characters' })
  benefits?: string;

  @IsOptional()
  @IsString({ message: 'Company ID must be a string' })
  companyId?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'], {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE'
  })
  jobType?: string;

  @IsOptional()
  @IsEnum(['REMOTE', 'ONSITE', 'HYBRID'], {
    message: 'Work mode must be one of: REMOTE, ONSITE, HYBRID'
  })
  workMode?: string;

  @IsOptional()
  @IsEnum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'], {
    message: 'Experience level must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE'
  })
  experienceLevel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum experience must be a number' })
  @Min(0, { message: 'Minimum experience must be positive' })
  minExperience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum experience must be a number' })
  @Min(0, { message: 'Maximum experience must be positive' })
  maxExperience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be positive' })
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be positive' })
  maxSalary?: number;

  @IsOptional()
  @IsBoolean({ message: 'Salary negotiable must be a boolean' })
  salaryNegotiable?: boolean;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skillsRequired?: string[];

  @IsOptional()
  @IsEnum(['HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL'], {
    message: 'Education level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL'
  })
  educationLevel?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Expires at must be a valid date' })
  expiresAt?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'], {
    message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED, ARCHIVED'
  })
  status?: string;
}

export class JobListQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Company ID must be a string' })
  company?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Job type must be a string' })
  type?: string;

  @IsOptional()
  @IsString({ message: 'Experience level must be a string' })
  experience?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

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
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class JobStatsResponseDto {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  totalViews: number;
  averageApplicationsPerJob: number;
  averageViewsPerJob: number;
  recentApplications: number;
  recentViews: number;
}

export class JobApplicationsResponseDto {
  applications: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
