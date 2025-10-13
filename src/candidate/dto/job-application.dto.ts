import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

// =================================================================
// JOB APPLICATION DTOs
// =================================================================

export class ApplyForJobDto {
  @IsOptional()
  @IsString({ message: 'Resume ID must be a string' })
  resumeId?: string;

  @IsOptional()
  @IsString({ message: 'Cover letter must be a string' })
  coverLetter?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString({ message: 'Cover letter must be a string' })
  coverLetter?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status?: ApplicationStatus;
}

export class ApplicationResponseDto {
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
  job?: {
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
  resume?: {
    id: string;
    title: string;
    fileName: string;
    uploadedAt: Date;
  };
}

export class ApplicationsResponseDto {
  applications: ApplicationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApplicationHistoryQueryDto {
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
  @IsString({ message: 'Applied from date must be a string (YYYY-MM-DD)' })
  appliedFrom?: string;

  @IsOptional()
  @IsString({ message: 'Applied to date must be a string (YYYY-MM-DD)' })
  appliedTo?: string;

  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}
