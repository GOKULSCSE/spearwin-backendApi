export declare class ResumeQueryDto {
    search?: string;
    candidateId?: string;
    isDefault?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
}
export declare class AdminResumeResponseDto {
    id: string;
    candidateId: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    isDefault: boolean;
    uploadedAt: Date;
    updatedAt: Date;
    candidate: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        currentTitle?: string;
        experienceYears?: number;
    };
}
export declare class ResumesListResponseDto {
    resumes: AdminResumeResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class ResumeStatsResponseDto {
    total: number;
    byMimeType: {
        'application/pdf': number;
        'application/msword': number;
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': number;
        'text/plain': number;
        other: number;
    };
    averageFileSize: number;
    recentUploads: number;
    defaultResumes: number;
}
export declare class BulkDownloadDto {
    resumeIds: string[];
}
export declare class BulkDownloadResponseDto {
    success: boolean;
    message: string;
    data: {
        downloadUrl: string;
        expiresAt: Date;
        fileCount: number;
        totalSize: number;
    };
}
