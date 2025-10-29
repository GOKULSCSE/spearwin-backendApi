export declare class CompanyResponseDto {
    id: string;
    userId?: string | null;
    name: string;
    slug: string;
    uuid: string;
    description?: string | null;
    website?: string | null;
    logo?: string | null;
    industry?: string | null;
    foundedYear?: number | null;
    employeeCount?: string | null;
    headquarters?: string | null;
    address?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    facebookUrl?: string | null;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    user?: {
        id: string;
        email: string;
        role: string;
        status: string;
    };
}
export declare class CompanyListResponseDto {
    companies: CompanyResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class CompanyStatsResponseDto {
    totalJobs: number;
    activeJobs: number;
    draftJobs: number;
    closedJobs: number;
    totalApplications: number;
    pendingApplications: number;
    shortlistedApplications: number;
    selectedApplications: number;
    rejectedApplications: number;
    averageApplicationTime: number;
    lastJobPosted?: Date | null;
    mostPopularJobType?: string;
    mostPopularWorkMode?: string;
}
