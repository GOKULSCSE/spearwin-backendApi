import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateJobDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(10, 5000, { message: 'Description must be between 10 and 5000 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Requirements must be a string' })
  @Length(10, 2000, { message: 'Requirements must be between 10 and 2000 characters' })
  requirements?: string;

  @IsOptional()
  @IsString({ message: 'Responsibilities must be a string' })
  @Length(10, 2000, { message: 'Responsibilities must be between 10 and 2000 characters' })
  responsibilities?: string;

  @IsOptional()
  @IsString({ message: 'Benefits must be a string' })
  @Length(10, 1000, { message: 'Benefits must be between 10 and 1000 characters' })
  benefits?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be positive' })
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be positive' })
  maxSalary?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @Length(3, 3, { message: 'Currency must be 3 characters (e.g., USD, EUR)' })
  currency?: string;

  @IsOptional()
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'], {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE'
  })
  jobType?: string;

  @IsOptional()
  @IsEnum(['REMOTE', 'ONSITE', 'HYBRID'], {
    message: 'Work mode must be one of: REMOTE, ONSITE, HYBRID'
  })
  workMode?: string;

  @IsOptional()
  @IsEnum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'], {
    message: 'Experience level must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE'
  })
  experienceLevel?: string;

  @IsOptional()
  @IsString({ message: 'Company ID must be a string' })
  companyId?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skillsRequired?: string[];

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'Application deadline must be a valid date' })
  applicationDeadline?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'CLOSED'], {
    message: 'Status must be one of: DRAFT, PUBLISHED, CLOSED'
  })
  status?: string;
}
