import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Define enums locally to avoid import issues
export enum LogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  PHONE_VERIFY = 'PHONE_VERIFY',
  JOB_APPLY = 'JOB_APPLY',
  JOB_CREATE = 'JOB_CREATE',
  JOB_UPDATE = 'JOB_UPDATE',
  JOB_DELETE = 'JOB_DELETE',
  COMPANY_CREATE = 'COMPANY_CREATE',
  COMPANY_UPDATE = 'COMPANY_UPDATE',
  COMPANY_DELETE = 'COMPANY_DELETE',
  ADMIN_ACTION = 'ADMIN_ACTION',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class ActivityLogsQueryDto {
  @IsOptional()
  @IsEnum(Object.values(LogAction), { message: 'Invalid action filter' })
  action?: LogAction;

  @IsOptional()
  @IsEnum(Object.values(LogLevel), { message: 'Invalid level filter' })
  level?: LogLevel;

  @IsOptional()
  @IsString({ message: 'Entity must be a string' })
  entity?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}
