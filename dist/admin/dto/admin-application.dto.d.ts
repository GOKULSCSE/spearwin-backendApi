import { ApplicationStatus } from '@prisma/client';
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
}
export declare class AddApplicationFeedbackDto {
    feedback: string;
}
export declare class ApplicationQueryDto {
    status?: string;
    jobTitle?: string;
    companyName?: string;
    candidateName?: string;
    appliedFrom?: string;
    appliedTo?: string;
    page?: string;
    limit?: string;
}
export declare class AdminApplicationResponseDto {
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
    job: {
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
    candidate: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        profilePicture?: string;
        currentTitle?: string;
        experienceYears?: number;
        city?: {
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
    resume?: {
        id: string;
        title: string;
        fileName: string;
        uploadedAt: Date;
    };
}
export declare class ApplicationsListResponseDto {
    applications: AdminApplicationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class ApplicationStatsResponseDto {
    total: number;
    byStatus: {
        APPLIED: number;
        UNDER_REVIEW: number;
        SHORTLISTED: number;
        INTERVIEWED: number;
        SELECTED: number;
        REJECTED: number;
        WITHDRAWN: number;
    };
    byJobType: {
        FULL_TIME: number;
        PART_TIME: number;
        CONTRACT: number;
        INTERNSHIP: number;
        FREELANCE: number;
    };
    byExperienceLevel: {
        ENTRY_LEVEL: number;
        MID_LEVEL: number;
        SENIOR_LEVEL: number;
        EXECUTIVE: number;
    };
    recentApplications: number;
    averageResponseTime: number;
}
export declare class BulkUpdateApplicationsDto {
    applicationIds: string[];
    status: ApplicationStatus;
    feedback?: string;
}
export declare class BulkUpdateResponseDto {
    success: boolean;
    updatedCount: number;
    failedCount: number;
    failedApplications: {
        applicationId: string;
        error: string;
    }[];
    message: string;
}
export declare class BulkExportQueryDto {
    status?: string;
    jobTitle?: string;
    companyName?: string;
    candidateName?: string;
    appliedFrom?: string;
    appliedTo?: string;
    format?: string;
}
export declare class BulkExportResponseDto {
    success: boolean;
    downloadUrl: string;
    fileName: string;
    totalExported: number;
    message: string;
}
