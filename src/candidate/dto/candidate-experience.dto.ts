import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateExperienceDto {
  @IsString({ message: 'Company must be a string' })
  @Transform(({ value }) => value?.trim())
  company: string;

  @IsString({ message: 'Position must be a string' })
  @Transform(({ value }) => value?.trim())
  position: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is current must be a boolean value' })
  isCurrent?: boolean;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Achievements must be a string' })
  achievements?: string;
}

export class UpdateCandidateExperienceDto {
  @IsOptional()
  @IsString({ message: 'Company must be a string' })
  @Transform(({ value }) => value?.trim())
  company?: string;

  @IsOptional()
  @IsString({ message: 'Position must be a string' })
  @Transform(({ value }) => value?.trim())
  position?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is current must be a boolean value' })
  isCurrent?: boolean;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Achievements must be a string' })
  achievements?: string;
}

export class CandidateExperienceResponseDto {
  id: string;
  candidateId: string;
  company: string;
  position: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  location?: string | null;
  achievements?: string | null;
  createdAt: Date;
}
