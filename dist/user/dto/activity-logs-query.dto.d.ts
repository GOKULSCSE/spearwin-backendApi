import { LogAction, LogLevel } from '@prisma/client';
export declare class ActivityLogsQueryDto {
    action?: LogAction;
    level?: LogLevel;
    entity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
