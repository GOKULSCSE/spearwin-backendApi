export declare class CreateCandidateSkillDto {
    skillName: string;
    level?: string;
    yearsUsed?: number;
    proficiencyLevel?: number;
    description?: string;
}
export declare class UpdateCandidateSkillDto {
    skillName?: string;
    level?: string;
    yearsUsed?: number;
    proficiencyLevel?: number;
    description?: string;
}
export interface CandidateSkillResponseDto {
    id: string;
    candidateId: string;
    skillName: string;
    level: string | null;
    yearsUsed: number | null;
    proficiencyLevel?: number;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
