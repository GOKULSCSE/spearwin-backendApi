export declare class CreateJobDto {
    title: string;
    description: string;
    requirements?: string;
    responsibilities?: string;
    benefits?: string;
    companyId: string;
    cityId?: string;
    address?: string;
    jobType: string;
    workMode: string;
    experienceLevel: string;
    minExperience?: number;
    maxExperience?: number;
    minSalary?: number;
    maxSalary?: number;
    salaryNegotiable?: boolean;
    skillsRequired?: string[];
    educationLevel?: string;
    expiresAt?: string;
    status?: string;
}
export declare class UpdateJobDto {
    title?: string;
    description?: string;
    requirements?: string;
    responsibilities?: string;
    benefits?: string;
    companyId?: string;
    cityId?: string;
    address?: string;
    jobType?: string;
    workMode?: string;
    experienceLevel?: string;
    minExperience?: number;
    maxExperience?: number;
    minSalary?: number;
    maxSalary?: number;
    salaryNegotiable?: boolean;
    skillsRequired?: string[];
    educationLevel?: string;
    expiresAt?: string;
    status?: string;
}
export declare class JobListQueryDto {
    search?: string;
    company?: string;
    city?: string;
    type?: string;
    experience?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class JobStatsResponseDto {
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    closedJobs: number;
    totalApplications: number;
    totalViews: number;
    averageApplicationsPerJob: number;
    averageViewsPerJob: number;
    recentApplications: number;
    recentViews: number;
}
export declare class JobApplicationsResponseDto {
    applications: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
