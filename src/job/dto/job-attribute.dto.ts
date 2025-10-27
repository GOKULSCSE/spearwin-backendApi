import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Model } from 'firebase-admin/machine-learning';

// Define JobAttributeCategory enum locally to avoid import issues
export enum JobAttributeCategory {
  SKILL = 'SKILL',
  EXPERIENCE = 'EXPERIENCE',
  EDUCATION = 'EDUCATION',
  LOCATION = 'LOCATION',
  INDUSTRY = 'INDUSTRY',
  COMPANY_SIZE = 'COMPANY_SIZE',
  JOB_TYPE = 'JOB_TYPE',
  SALARY_RANGE = 'SALARY_RANGE',
  BENEFITS = 'BENEFITS',
  REQUIREMENTS = 'REQUIREMENTS',
  PREFERENCES = 'PREFERENCES',
}

// =================================================================
// CREATE JOB ATTRIBUTE DTO
// =================================================================

export class CreateJobAttributeDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(Object.values(JobAttributeCategory), {
    message: 'Category must be a valid job attribute category',
  })
  category: JobAttributeCategory;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean = true;

  @IsOptional()
  @IsInt({ message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order must be at least 0' })
  sortOrder?: number = 0;
}

// =================================================================
// UPDATE JOB ATTRIBUTE DTO
// =================================================================

export class UpdateJobAttributeDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsEnum(Object.values(JobAttributeCategory), {
    message: 'Category must be a valid job attribute category',
  })
  category?: JobAttributeCategory;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'Sort order must be a number' })
  @Min(0, { message: 'Sort order must be at least 0' })
  sortOrder?: number;
}

// =================================================================
// JOB ATTRIBUTE QUERY DTO
// =================================================================

export class JobAttributeQueryDto {
  @IsOptional()
  @IsEnum(Object.values(JobAttributeCategory), {
    message: 'Category must be a valid job attribute category',
  })
  category?: JobAttributeCategory;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsInt({ message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'sortOrder';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'asc';
}

// =================================================================
// BULK CREATE JOB ATTRIBUTES DTO
// =================================================================

export class BulkCreateJobAttributesDto {
  @IsEnum(Object.values(JobAttributeCategory), {
    message: 'Category must be a valid job attribute category',
  })
  category: JobAttributeCategory;

  @IsNotEmpty({ message: 'Attributes array is required' })
  attributes: {
    name: string;
    description?: string;
    sortOrder?: number;
  }[];
}

// =================================================================
// JOB ATTRIBUTE RESPONSE DTO
// =================================================================

export class JobAttributeResponseDto {
  id: string;
  name: string;
  category: JobAttributeCategory;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// JOB ATTRIBUTE LIST RESPONSE DTO
// =================================================================

export class JobAttributeListResponseDto {
  success: boolean;
  message: string;
  data: JobAttributeResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =================================================================
// JOB ATTRIBUTE CATEGORIES RESPONSE DTO
// =================================================================

export class JobAttributeCategoriesResponseDto {
  success: boolean;
  message: string;
  data: {
    category: JobAttributeCategory;
    attributes: JobAttributeResponseDto[];
  }[];
}



