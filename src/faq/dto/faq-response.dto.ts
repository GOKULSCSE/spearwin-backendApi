import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FaqResponseDto {
  id: number;
  question: string;
  answer: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FaqListQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    console.log('[FAQ DTO Transform] Raw active value:', value, 'Type:', typeof value);
    // Handle all possible string representations
    if (value === 'true' || value === true || value === 1 || value === '1') {
      console.log('[FAQ DTO Transform] Converting to boolean true');
      return true;
    }
    if (value === 'false' || value === false || value === 0 || value === '0') {
      console.log('[FAQ DTO Transform] Converting to boolean false');
      return false;
    }
    // If value is already a boolean, return it
    if (typeof value === 'boolean') {
      console.log('[FAQ DTO Transform] Already boolean:', value);
      return value;
    }
    // Return undefined if value is not provided
    console.log('[FAQ DTO Transform] Returning undefined for:', value);
    return undefined;
  })
  @IsBoolean({ message: 'Active filter must be a boolean' })
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(1000, { message: 'Limit must not exceed 1000' })
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Offset must be a number' })
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number = 0;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class FaqListResponseDto {
  faqs: FaqResponseDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
