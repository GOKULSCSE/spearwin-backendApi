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
                id: number;
                name: string;
                state_id: number;
                state_code?: string | null;
                state_name?: string | null;
                country_id?: number | null;
                country_code?: string | null;
                country_name?: string | null;
                latitude?: string | null;
                longitude?: string | null;
                wikiDataId?: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                state: {
                    id: number;
                    name: string;
                    country_id: number;
                    country_code?: string | null;
                    country_name?: string | null;
                    iso2?: string | null;
                    fips_code?: string | null;
                    type?: string | null;
                    level?: string | null;
                    parent_id?: number | null;
                    latitude?: string | null;
                    longitude?: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    country: {
                        id: number;
                        name: string;
                        iso3?: string | null;
                        iso2?: string | null;
                        numeric_code?: string | null;
                        phonecode?: string | null;
                        capital?: string | null;
                        currency?: string | null;
                        currency_name?: string | null;
                        currency_symbol?: string | null;
                        tld?: string | null;
                        native?: string | null;
                        region?: string | null;
                        region_id?: number | null;
                        subregion?: string | null;
                        subregion_id?: number | null;
                        nationality?: string | null;
                        latitude?: string | null;
                        longitude?: string | null;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
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
            id: number;
            name: string;
            state_id: number;
            state_code?: string | null;
            state_name?: string | null;
            country_id?: number | null;
            country_code?: string | null;
            country_name?: string | null;
            latitude?: string | null;
            longitude?: string | null;
            wikiDataId?: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            state: {
                id: number;
                name: string;
                country_id: number;
                country_code?: string | null;
                country_name?: string | null;
                iso2?: string | null;
                fips_code?: string | null;
                type?: string | null;
                level?: string | null;
                parent_id?: number | null;
                latitude?: string | null;
                longitude?: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                country: {
                    id: number;
                    name: string;
                    iso3?: string | null;
                    iso2?: string | null;
                    numeric_code?: string | null;
                    phonecode?: string | null;
                    capital?: string | null;
                    currency?: string | null;
                    currency_name?: string | null;
                    currency_symbol?: string | null;
                    tld?: string | null;
                    native?: string | null;
                    region?: string | null;
                    region_id?: number | null;
                    subregion?: string | null;
                    subregion_id?: number | null;
                    nationality?: string | null;
                    latitude?: string | null;
                    longitude?: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
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
