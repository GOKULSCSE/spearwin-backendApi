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
        id: number;
        name: string;
        state_id: number;
        state_code?: string | null;
        state_name?: string | null;
        country_id?: number | null;
        country_code?: string | null;
        country_name?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        wikiDataId?: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        state: {
          id: number;
          name: string;
          country_id: number;
          country_code?: string | null;
          country_name?: string | null;
          iso2?: string | null;
          fips_code?: string | null;
          type?: string | null;
          level?: string | null;
          parent_id?: number | null;
          latitude?: string | null;
          longitude?: string | null;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
          country: {
            id: number;
            name: string;
            iso3?: string | null;
            iso2?: string | null;
            numeric_code?: string | null;
            phonecode?: string | null;
            capital?: string | null;
            currency?: string | null;
            currency_name?: string | null;
            currency_symbol?: string | null;
            tld?: string | null;
            native?: string | null;
            region?: string | null;
            region_id?: number | null;
            subregion?: string | null;
            subregion_id?: number | null;
            nationality?: string | null;
            latitude?: string | null;
            longitude?: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
