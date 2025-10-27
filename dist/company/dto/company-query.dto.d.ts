export declare class CompanyQueryDto {
    search?: string;
    industry?: string;
    country?: string;
    state?: string;
    city?: string;
    isVerified?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
