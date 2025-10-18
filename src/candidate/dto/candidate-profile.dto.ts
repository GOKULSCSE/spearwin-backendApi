import {
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsEmail,
  IsPhoneNumber,
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
  @IsString({ message: 'Father name must be a string' })
  @Transform(({ value }) => value?.trim())
  fatherName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Marital status must be a string' })
  maritalStatus?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Current title must be a string' })
  currentTitle?: string;

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

  @IsOptional()
  @IsNumber({}, { message: 'Experience years must be a number' })
  @Min(0, { message: 'Experience years must be at least 0' })
  @Max(50, { message: 'Experience years must not exceed 50' })
  experienceYears?: number;

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

  // Additional fields
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Mobile number must be a valid phone number' })
  mobileNumber?: string;

  @IsOptional()
  @IsString({ message: 'Job experience must be a string' })
  jobExperience?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'City name must be a string' })
  cityName?: string;

  @IsOptional()
  @IsString({ message: 'Street address must be a string' })
  streetAddress?: string;

  @IsOptional()
  @IsString({ message: 'Profile summary must be a string' })
  profileSummary?: string;
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
  // Additional fields
  email?: string;
  mobileNumber?: string;
  jobExperience?: string;
  country?: string;
  state?: string;
  cityName?: string;
  streetAddress?: string;
  profileSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    email: string;
    phone?: string | null;
  };
  city?: {
    id: number;
    name: string;
      state_id?: number | null;
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
        name?: string | null;
        country_id?: number | null;
        state_id?: number | null;
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
        country?: {
          id: number;
          name: string | null;
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
  } | null;
}
