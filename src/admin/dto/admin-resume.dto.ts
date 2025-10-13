import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// =================================================================
// ADMIN RESUME MANAGEMENT DTOs
// =================================================================

export class ResumeQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Candidate ID must be a string' })
  candidateId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is default must be a boolean' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isDefault?: boolean;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}

export class AdminResumeResponseDto {
  id: string;
  candidateId: string;
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  uploadedAt: Date;
  updatedAt: Date;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentTitle?: string;
    experienceYears?: number;
  };
}

export class ResumesListResponseDto {
  resumes: AdminResumeResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ResumeStatsResponseDto {
  total: number;
  byMimeType: {
    'application/pdf': number;
    'application/msword': number;
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': number;
    'text/plain': number;
    other: number;
  };
  averageFileSize: number;
  recentUploads: number; // Resumes uploaded in last 7 days
  defaultResumes: number;
}

export class BulkDownloadDto {
  @IsArray({ message: 'Resume IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each resume ID must be a valid UUID' })
  resumeIds: string[];
}

export class BulkDownloadResponseDto {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    expiresAt: Date;
    fileCount: number;
    totalSize: number;
  };
}
