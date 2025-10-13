export declare class JobQueryDto {
    search?: string;
    company?: string;
    city?: string;
    type?: string;
    experience?: string;
    salary_min?: number;
    salary_max?: number;
    skills?: string[];
    remote?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class JobSearchDto {
    q?: string;
    location?: string;
    type?: string;
    experience?: string;
    salary_min?: number;
    skills?: string[];
    remote?: boolean;
    page?: number;
    limit?: number;
}
