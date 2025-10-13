export declare class CreateCandidateSkillDto {
    skillName: string;
    level?: string;
    yearsUsed?: number;
}
export declare class UpdateCandidateSkillDto {
    skillName?: string;
    level?: string;
    yearsUsed?: number;
}
export declare class CandidateSkillResponseDto {
    id: string;
    candidateId: string;
    skillName: string;
    level?: string | null;
    yearsUsed?: number | null;
}
