export declare class JobResponseDto {
    id: string;
    title: string;
    slug: string;
    description: string;
    requirements: string;
    responsibilities: string;
    benefits?: string | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    currency?: string | null;
    jobType: string;
    workMode: string;
    experienceLevel: string;
    status: string;
    isRemote: boolean;
    viewCount: number;
    applicationCount: number;
    applicationDeadline?: Date | null;
    publishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    company: {
        id: string;
        name: string;
        logo?: string | null;
        industry?: string | null;
        size?: string | null;
        website?: string | null;
    };
    location?: {
        city: {
            id: string;
            name: string;
            state: {
                id: string;
                name: string;
                code?: string | null;
                country: {
                    id: string;
                    name: string;
                    code: string;
                };
            };
        };
    } | null;
    skillsRequired?: string[];
    tags?: string[];
}
export declare class JobListResponseDto {
    jobs: JobResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class JobFiltersResponseDto {
    companies: {
        id: string;
        name: string;
        logo?: string | null;
    }[];
    locations: {
        id: number;
        name: string;
        state: string;
        country: string;
    }[];
    jobTypes: string[];
    experienceLevels: string[];
    workModes: string[];
    skills: string[];
    salaryRanges: {
        min: number;
        max: number;
    };
}
export declare class JobViewResponseDto {
    message: string;
    viewCount: number;
}
