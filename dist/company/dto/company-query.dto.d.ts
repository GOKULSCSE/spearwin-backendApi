export declare class CompanyQueryDto {
    search?: string;
    industry?: string;
    cityId?: string;
    isVerified?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
