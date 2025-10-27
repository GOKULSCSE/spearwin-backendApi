export interface ActivityLogsResponseDto {
  logs: {
    id: string;
    action: string;
    level: string;
    entity: string | null;
    entityId: string | null;
    description: string;
    metadata: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}