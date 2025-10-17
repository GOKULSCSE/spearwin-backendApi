export declare enum LogAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    REGISTER = "REGISTER",
    PASSWORD_CHANGE = "PASSWORD_CHANGE",
    PROFILE_UPDATE = "PROFILE_UPDATE",
    EMAIL_VERIFY = "EMAIL_VERIFY",
    PHONE_VERIFY = "PHONE_VERIFY",
    JOB_APPLY = "JOB_APPLY",
    JOB_CREATE = "JOB_CREATE",
    JOB_UPDATE = "JOB_UPDATE",
    JOB_DELETE = "JOB_DELETE",
    COMPANY_CREATE = "COMPANY_CREATE",
    COMPANY_UPDATE = "COMPANY_UPDATE",
    COMPANY_DELETE = "COMPANY_DELETE",
    ADMIN_ACTION = "ADMIN_ACTION",
    SYSTEM_ACTION = "SYSTEM_ACTION"
}
export declare enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}
export declare class ActivityLogsQueryDto {
    action?: LogAction;
    level?: LogLevel;
    entity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
