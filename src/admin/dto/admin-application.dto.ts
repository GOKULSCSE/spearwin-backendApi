import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

// =================================================================
// ADMIN APPLICATION MANAGEMENT DTOs
// =================================================================

export class UpdateApplicationStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status: ApplicationStatus;
}

export class AddApplicationFeedbackDto {
  @IsNotEmpty({ message: 'Feedback is required' })
  @IsString({ message: 'Feedback must be a string' })
  feedback: string;
}

export class ApplicationQueryDto {
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Candidate name must be a string' })
  candidateName?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Applied from date must be a valid date (YYYY-MM-DD)' },
  )
  appliedFrom?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Applied to date must be a valid date (YYYY-MM-DD)' },
  )
  appliedTo?: string;

  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}

export class AdminApplicationResponseDto {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  feedback?: string;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    slug: string;
    description: string;
    company: {
      id: string;
      name: string;
      logo?: string;
    };
    location?: {
      city: {
        id: string;
        name: string;
        state: {
          id: string;
          name: string;
          code?: string;
          country: {
            id: string;
            name: string;
            code: string;
          };
        };
      };
    };
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    currentTitle?: string;
    experienceYears?: number;
    city?: {
      id: string;
      name: string;
      state: {
        id: string;
        name: string;
        code?: string;
        country: {
          id: string;
          name: string;
          code: string;
        };
      };
    };
  };
  resume?: {
    id: string;
    title: string;
    fileName: string;
    uploadedAt: Date;
  };
}

export class ApplicationsListResponseDto {
  applications: AdminApplicationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApplicationStatsResponseDto {
  total: number;
  byStatus: {
    APPLIED: number;
    UNDER_REVIEW: number;
    SHORTLISTED: number;
    INTERVIEWED: number;
    SELECTED: number;
    REJECTED: number;
    WITHDRAWN: number;
  };
  byJobType: {
    FULL_TIME: number;
    PART_TIME: number;
    CONTRACT: number;
    INTERNSHIP: number;
    FREELANCE: number;
  };
  byExperienceLevel: {
    ENTRY_LEVEL: number;
    MID_LEVEL: number;
    SENIOR_LEVEL: number;
    EXECUTIVE: number;
  };
  recentApplications: number; // Applications in last 7 days
  averageResponseTime: number; // Average days from application to review
}

// =================================================================
// BULK OPERATIONS DTOs
// =================================================================

export class BulkUpdateApplicationsDto {
  @IsNotEmpty({ message: 'Application IDs are required' })
  @IsString({ message: 'Application IDs must be an array of strings' })
  applicationIds: string[];

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status: ApplicationStatus;

  @IsOptional()
  @IsString({ message: 'Feedback must be a string' })
  feedback?: string;
}

export class BulkUpdateResponseDto {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  failedApplications: {
    applicationId: string;
    error: string;
  }[];
  message: string;
}

export class BulkExportQueryDto {
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Candidate name must be a string' })
  candidateName?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Applied from date must be a valid date (YYYY-MM-DD)' },
  )
  appliedFrom?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Applied to date must be a valid date (YYYY-MM-DD)' },
  )
  appliedTo?: string;

  @IsOptional()
  @IsString({ message: 'Format must be csv or excel' })
  format?: string;
}

export class BulkExportResponseDto {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  totalExported: number;
  message: string;
}
