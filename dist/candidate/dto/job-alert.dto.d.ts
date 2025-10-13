export declare class CreateJobAlertDto {
    title: string;
    keywords?: string;
    location?: string;
    skills?: string[];
    jobType?: string;
    experienceLevel?: string;
    company?: string;
    isActive?: boolean;
    frequency?: string;
}
export declare class UpdateJobAlertDto {
    title?: string;
    keywords?: string;
    location?: string;
    skills?: string[];
    jobType?: string;
    experienceLevel?: string;
    company?: string;
    isActive?: boolean;
    frequency?: string;
}
export declare class JobAlertResponseDto {
    id: string;
    candidateId: string;
    title: string;
    keywords?: string;
    location?: string;
    skills?: string[];
    jobType?: string;
    experienceLevel?: string;
    company?: string;
    isActive: boolean;
    frequency: string;
    lastSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RecommendedJobsResponseDto {
    jobs: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class JobAlertsResponseDto {
    alerts: JobAlertResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
