import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// =================================================================
// ADVANCED CV SEARCH DTOs
// =================================================================

export class AdvancedCVSearchQueryDto {
  @IsOptional()
  @IsString({ message: 'Search keywords must be a string' })
  keywords?: string;

  @IsOptional()
  @IsString({ message: 'Skills must be a string' })
  skills?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  company?: string;

  @IsOptional()
  @IsInt({ message: 'Minimum experience must be an integer' })
  @Min(0, { message: 'Minimum experience must be at least 0' })
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  })
  minExperience?: number;

  @IsOptional()
  @IsInt({ message: 'Maximum experience must be an integer' })
  @Min(0, { message: 'Maximum experience must be at least 0' })
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  })
  maxExperience?: number;

  @IsOptional()
  @IsString({ message: 'Candidate name must be a string' })
  candidateName?: string;

  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: 'Sort order must be asc or desc' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}

export interface AdvancedCVSearchResult {
  candidateId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentLocation?: string;
  expectedSalary?: number;
  skills: string[];
  resumeId: string;
  resumeFileName: string;
  resumeUploadedAt: Date;
  matchScore?: number; // Optional relevance score
  matchedSnippets?: string[]; // Text snippets that matched the search
}

export class AdvancedCVSearchResponseDto {
  results: AdvancedCVSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  searchQuery: {
    keywords?: string;
    skills?: string;
    location?: string;
    company?: string;
    minExperience?: number;
    maxExperience?: number;
  };
}

