import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateSkillDto {
  @IsString({ message: 'Skill name must be a string' })
  @Transform(({ value }) => value?.trim())
  skillName: string;

  @IsOptional()
  @IsString({ message: 'Level must be a string' })
  level?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Years used must be a number' })
  @Min(0, { message: 'Years used must be at least 0' })
  @Max(50, { message: 'Years used must not exceed 50' })
  yearsUsed?: number;
}

export class UpdateCandidateSkillDto {
  @IsOptional()
  @IsString({ message: 'Skill name must be a string' })
  @Transform(({ value }) => value?.trim())
  skillName?: string;

  @IsOptional()
  @IsString({ message: 'Level must be a string' })
  level?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Years used must be a number' })
  @Min(0, { message: 'Years used must be at least 0' })
  @Max(50, { message: 'Years used must not exceed 50' })
  yearsUsed?: number;
}

export class CandidateSkillResponseDto {
  id: string;
  candidateId: string;
  skillName: string;
  level?: string | null;
  yearsUsed?: number | null;
}
