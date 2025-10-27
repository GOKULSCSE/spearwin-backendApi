import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCandidateSkillDto {
  @IsString()
  @IsNotEmpty()
  skillName: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumber()
  yearsUsed?: number;

  @IsOptional()
  @IsNumber()
  proficiencyLevel?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCandidateSkillDto {
  @IsOptional()
  @IsString()
  skillName?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumber()
  yearsUsed?: number;

  @IsOptional()
  @IsNumber()
  proficiencyLevel?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export interface CandidateSkillResponseDto {
  id: string;
  candidateId: string;
  skillName: string;
  level: string | null;
  yearsUsed: number | null;
  proficiencyLevel?: number; // Made optional since it might not always be present
  description?: string;
  createdAt?: Date; // Made optional since it might not always be present
  updatedAt?: Date; // Made optional since it might not always be present
}