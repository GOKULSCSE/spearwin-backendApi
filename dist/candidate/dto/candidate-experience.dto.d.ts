export declare class CreateCandidateExperienceDto {
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    achievements?: string;
}
export declare class UpdateCandidateExperienceDto {
    company?: string;
    position?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    achievements?: string;
}
export declare class CandidateExperienceResponseDto {
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
