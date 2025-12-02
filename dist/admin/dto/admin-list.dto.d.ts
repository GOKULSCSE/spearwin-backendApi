export declare class AdminListQueryDto {
    search?: string;
    role?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
}
export interface AdminListResponseDto {
    admins: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
