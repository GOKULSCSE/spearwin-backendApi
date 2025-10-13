"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogsResponseDto = exports.ActivityLogResponseDto = void 0;
class ActivityLogResponseDto {
    id;
    action;
    level;
    entity;
    entityId;
    description;
    metadata;
    ipAddress;
    userAgent;
    createdAt;
}
exports.ActivityLogResponseDto = ActivityLogResponseDto;
class ActivityLogsResponseDto {
    logs;
    total;
    page;
    limit;
    totalPages;
}
exports.ActivityLogsResponseDto = ActivityLogsResponseDto;
//# sourceMappingURL=activity-logs-response.dto.js.map