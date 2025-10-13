import { LogAction, LogLevel } from '@prisma/client';
export declare class ActivityLogResponseDto {
    id: string;
    action: LogAction;
    level: LogLevel;
    entity?: string | null;
    entityId?: string | null;
    description: string;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
}
export declare class ActivityLogsResponseDto {
    logs: ActivityLogResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
