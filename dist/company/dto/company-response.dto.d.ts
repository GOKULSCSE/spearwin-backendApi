export declare class CompanyResponseDto {
    id: number;
    userId?: number | null;
    name: string;
    slug: string;
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
        updatedAt?: Date;
        state?: {
            id: number;
            name: string | null;
            country_id: number | null;
            country_code?: string | null;
            country_name?: string | null;
            iso2?: string | null;
            fips_code?: string | null;
            type?: string | null;
            latitude?: string | null;
            longitude?: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt?: Date;
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
