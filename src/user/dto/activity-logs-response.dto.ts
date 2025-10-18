import { LogAction, LogLevel } from '@prisma/client';

export class ActivityLogResponseDto {
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

export class ActivityLogsResponseDto {
  logs: ActivityLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
