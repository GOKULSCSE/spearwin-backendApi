import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { UpdateCandidateProfileDto } from './candidate-profile.dto';

export class ResumeUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  // From file upload API
  @IsOptional()
  @IsString()
  documentKey?: string; // maps to filePath

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  isDefault?: boolean;
}

export class ProfilePictureUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  // From file upload API  
  @IsOptional()
  @IsString()
  imageKey?: string; // maps to filePath

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  isDefault?: boolean;
}

export class SkillUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  skillName!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsUsed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  proficiencyLevel?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class EducationUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @IsString()
  level!: string; // maps to EducationLevel enum in Prisma

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  isCompleted?: boolean;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ExperienceUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  achievements?: string;
}

export class SkillsUpsertBlockDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillUpsertItemDto)
  upsert?: SkillUpsertItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete?: string[];
}

export class EducationUpsertBlockDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationUpsertItemDto)
  upsert?: EducationUpsertItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete?: string[];
}

export class ExperienceUpsertBlockDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceUpsertItemDto)
  upsert?: ExperienceUpsertItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete?: string[];
}

export class ResumesUpsertBlockDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeUpsertItemDto)
  upsert?: ResumeUpsertItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete?: string[];
}

export class ProfilePicturesUpsertBlockDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfilePictureUpsertItemDto)
  upsert?: ProfilePictureUpsertItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete?: string[];
}

export class UpsertFullProfileDto {
  @ValidateNested()
  @Type(() => UpdateCandidateProfileDto)
  profile!: UpdateCandidateProfileDto;

  // Optional profile picture object key from separate upload step (legacy)
  @IsOptional()
  @IsString()
  profilePictureKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SkillsUpsertBlockDto)
  skills?: SkillsUpsertBlockDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationUpsertBlockDto)
  education?: EducationUpsertBlockDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceUpsertBlockDto)
  experience?: ExperienceUpsertBlockDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResumesUpsertBlockDto)
  resumes?: ResumesUpsertBlockDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfilePicturesUpsertBlockDto)
  profilePictures?: ProfilePicturesUpsertBlockDto;
}


