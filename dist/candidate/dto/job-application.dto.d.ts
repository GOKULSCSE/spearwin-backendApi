import { ApplicationStatus } from '@prisma/client';
export declare class ApplyForJobDto {
    resumeId?: string;
    resumeFilePath?: string;
    coverLetter?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    experienceLevel?: string;
    noticePeriod?: string;
    currentCTC?: string;
    expectedCTC?: string;
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
    resumeFilePath?: string;
    coverLetter?: string;
    status: ApplicationStatus;
    appliedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    feedback?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    experienceLevel?: string;
    noticePeriod?: string;
    currentCTC?: string;
    expectedCTC?: string;
    updatedAt: Date;
    job?: {
        id: string;
        title: string;
        slug: string;
        description: string;
        jobType?: string;
        workMode?: string;
        company: {
            id: string;
            name: string;
            companyId: string;
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
                    name: string | null;
                    country_id: number | null;
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
                    country?: {
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
