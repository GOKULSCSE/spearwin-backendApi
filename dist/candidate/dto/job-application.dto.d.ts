import { ApplicationStatus } from '@prisma/client';
export declare class ApplyForJobDto {
    resumeId?: string;
    coverLetter?: string;
}
export declare class UpdateApplicationDto {
    coverLetter?: string;
    status?: ApplicationStatus;
}
export declare class ApplicationResponseDto {
    id: string;
    jobId: string;
    candidateId: string;
    resumeId?: string;
    coverLetter?: string;
    status: ApplicationStatus;
    appliedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    feedback?: string;
    updatedAt: Date;
    job?: {
        id: string;
        title: string;
        slug: string;
        description: string;
        company: {
            id: string;
            name: string;
            logo?: string;
        };
        location?: {
            city: {
                id: string;
                name: string;
                state: {
                    id: string;
                    name: string;
                    code?: string;
                    country: {
                        id: string;
                        name: string;
                        code: string;
                    };
                };
            };
        };
    };
    resume?: {
        id: string;
        title: string;
        fileName: string;
        uploadedAt: Date;
    };
}
export declare class ApplicationsResponseDto {
    applications: ApplicationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class ApplicationHistoryQueryDto {
    status?: string;
    jobTitle?: string;
    companyName?: string;
    appliedFrom?: string;
    appliedTo?: string;
    page?: string;
    limit?: string;
}
