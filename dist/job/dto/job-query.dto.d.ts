export declare class JobQueryDto {
    search?: string;
    location?: string;
    category?: string;
    experience?: string;
    company?: string;
    city?: string;
    type?: string;
    salary_min?: number;
    salary_max?: number;
    skills?: string;
    remote?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
}
export declare class JobSearchDto {
    q?: string;
    keyword?: string;
    location?: string;
    category?: string;
    experience?: string;
    type?: string;
    salary_min?: number;
    skills?: string;
    remote?: boolean;
    page?: number;
    limit?: number;
}
