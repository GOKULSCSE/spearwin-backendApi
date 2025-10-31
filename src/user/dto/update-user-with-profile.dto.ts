import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsObject,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Candidate data DTO for update
export class UpdateCandidateDataDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Father name must be a string' })
  fatherName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
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
  @IsString({ message: 'Profile summary must be a string' })
  profileSummary?: string;

  @IsOptional()
  @IsString({ message: 'Current title must be a string' })
  currentTitle?: string;

  @IsOptional()
  @IsString({ message: 'Current company must be a string' })
  currentCompany?: string;

  @IsOptional()
  @IsString({ message: 'Current location must be a string' })
  currentLocation?: string;

  @IsOptional()
  @IsString({ message: 'Preferred location must be a string' })
  preferredLocation?: string;

  @IsOptional()
  @IsString({ message: 'Notice period must be a string' })
  noticePeriod?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Current salary must be a number' })
  currentSalary?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Expected salary must be a number' })
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'Profile type must be a string' })
  profileType?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Experience years must be a number' })
  experienceYears?: number;

  @IsOptional()
  @IsString({ message: 'City name must be a string' })
  cityName?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Street address must be a string' })
  streetAddress?: string;

  @IsOptional()
  @IsString({ message: 'Mobile number must be a string' })
  mobileNumber?: string;

  @IsOptional()
  @IsString({ message: 'Job experience must be a string' })
  jobExperience?: string;
}

export class UpdateUserWithProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Phone verified must be a boolean value' })
  phoneVerified?: boolean;

  @IsOptional()
  @IsObject({ message: 'Candidate data must be an object' })
  @ValidateNested()
  @Type(() => UpdateCandidateDataDto)
  candidateData?: UpdateCandidateDataDto;
}

