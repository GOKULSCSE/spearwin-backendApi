import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsUrl,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Current title must be a string' })
  currentTitle?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Experience years must be a number' })
  @Min(0, { message: 'Experience years must be at least 0' })
  @Max(50, { message: 'Experience years must not exceed 50' })
  experienceYears?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  @Min(0, { message: 'Expected salary must be at least 0' })
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'GitHub URL must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string;
}

export class UpdateAvailabilityDto {
  @IsBoolean({ message: 'Is available must be a boolean value' })
  isAvailable: boolean;
}

export class CandidateProfileResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  profilePicture?: string;
  bio?: string;
  currentTitle?: string;
  experienceYears?: number;
  expectedSalary?: number;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  };
}
