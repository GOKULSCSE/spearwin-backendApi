import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TestimonialQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // If value is undefined or null, return undefined
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    
    // If value is already a boolean, return it
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Handle string representations - be explicit about false
    // Convert to string, lowercase, and trim to handle edge cases
    const stringValue = String(value).toLowerCase().trim();
    
    // Explicitly check for false values first
    if (stringValue === 'false' || stringValue === '0') {
      return false;
    }
    
    // Explicitly check for true values
    if (stringValue === 'true' || stringValue === '1') {
      return true;
    }
    
    // If we can't parse it, return undefined
    return undefined;
  })
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min rating must be a number' })
  @Min(1, { message: 'Min rating must be at least 1' })
  @Max(5, { message: 'Min rating must not exceed 5' })
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max rating must be a number' })
  @Min(1, { message: 'Max rating must be at least 1' })
  @Max(5, { message: 'Max rating must not exceed 5' })
  maxRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
