import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateUserDto, UserRole } from './create-user.dto';

// Candidate data DTO
export class CandidateDataDto {
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Father name must be a string' })
  fatherName?: string;

  @IsOptional()
  @IsString({ message: 'Date of birth must be a valid date string' })
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
  currentSalary?: number;

  @IsOptional()
  expectedSalary?: number;

  @IsOptional()
  @IsString({ message: 'Profile type must be a string' })
  profileType?: string;

  @IsOptional()
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

  @IsOptional()
  @IsString({ message: 'Profile picture must be a string (URL)' })
  profilePicture?: string;

  @IsOptional()
  @IsString({ message: 'CV/Resume must be a string (URL)' })
  cvResume?: string;
}

export class CreateUserWithProfileDto extends CreateUserDto {
  @IsOptional()
  @IsObject({ message: 'Candidate data must be an object' })
  @ValidateNested()
  @Type(() => CandidateDataDto)
  candidateData?: CandidateDataDto;
}

