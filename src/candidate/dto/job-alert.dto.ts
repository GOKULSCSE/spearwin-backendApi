import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJobAlertDto {
  @IsString({ message: 'Title must be a string' })
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Keywords must be a string' })
  keywords?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @IsOptional()
  @IsString({ message: 'Job type must be a string' })
  jobType?: string;

  @IsOptional()
  @IsString({ message: 'Experience level must be a string' })
  experienceLevel?: string;

  @IsOptional()
  @IsString({ message: 'Company must be a string' })
  company?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean = true;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'], {
    message: 'Frequency must be one of: DAILY, WEEKLY, MONTHLY',
  })
  frequency?: string = 'WEEKLY';
}

export class UpdateJobAlertDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Keywords must be a string' })
  keywords?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @IsOptional()
  @IsString({ message: 'Job type must be a string' })
  jobType?: string;

  @IsOptional()
  @IsString({ message: 'Experience level must be a string' })
  experienceLevel?: string;

  @IsOptional()
  @IsString({ message: 'Company must be a string' })
  company?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'], {
    message: 'Frequency must be one of: DAILY, WEEKLY, MONTHLY',
  })
  frequency?: string;
}

export class JobAlertResponseDto {
  id: string;
  candidateId: string;
  title: string;
  keywords?: string;
  location?: string;
  skills?: string[];
  jobType?: string;
  experienceLevel?: string;
  company?: string;
  isActive: boolean;
  frequency: string;
  lastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class RecommendedJobsResponseDto {
  jobs: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class JobAlertsResponseDto {
  alerts: JobAlertResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
