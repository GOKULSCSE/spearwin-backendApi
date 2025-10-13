import { EducationLevel } from '@prisma/client';
export declare class CreateCandidateEducationDto {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    level: EducationLevel;
    startDate: string;
    endDate?: string;
    isCompleted?: boolean;
    grade?: string;
    description?: string;
}
export declare class UpdateCandidateEducationDto {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    level?: EducationLevel;
    startDate?: string;
    endDate?: string;
    isCompleted?: boolean;
    grade?: string;
    description?: string;
}
export declare class CandidateEducationResponseDto {
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
