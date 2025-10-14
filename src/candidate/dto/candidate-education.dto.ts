import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EducationLevel } from '@prisma/client';

export class CreateCandidateEducationDto {
  @IsString({ message: 'Institution must be a string' })
  @Transform(({ value }) => value?.trim())
  institution: string;

  @IsString({ message: 'Degree must be a string' })
  @Transform(({ value }) => value?.trim())
  degree: string;

  @IsOptional()
  @IsString({ message: 'Field of study must be a string' })
  fieldOfStudy?: string;

  @IsEnum(EducationLevel, {
    message:
      'Level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
  })
  level: EducationLevel;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is completed must be a boolean value' })
  isCompleted?: boolean;

  @IsOptional()
  @IsString({ message: 'Grade must be a string' })
  grade?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class UpdateCandidateEducationDto {
  @IsOptional()
  @IsString({ message: 'Institution must be a string' })
  @Transform(({ value }) => value?.trim())
  institution?: string;

  @IsOptional()
  @IsString({ message: 'Degree must be a string' })
  @Transform(({ value }) => value?.trim())
  degree?: string;

  @IsOptional()
  @IsString({ message: 'Field of study must be a string' })
  fieldOfStudy?: string;

  @IsOptional()
  @IsEnum(EducationLevel, {
    message:
      'Level must be one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, DOCTORATE, PROFESSIONAL',
  })
  level?: EducationLevel;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is completed must be a boolean value' })
  isCompleted?: boolean;

  @IsOptional()
  @IsString({ message: 'Grade must be a string' })
  grade?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class CandidateEducationResponseDto {
  id: string;
  candidateId: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  level: EducationLevel;
  startDate: Date;
  endDate?: Date | null;
  isCompleted: boolean;
  grade?: string | null;
  description?: string | null;
  createdAt: Date;
}
