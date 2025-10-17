import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePincodeDto {
  @IsString({ message: 'Code must be a string' })
  @MinLength(3, { message: 'Code must be at least 3 characters long' })
  @MaxLength(10, { message: 'Code must not exceed 10 characters' })
  @Transform(({ value }) => value?.trim())
  code: string;

  @IsOptional()
  @IsString({ message: 'Area must be a string' })
  @MaxLength(100, { message: 'Area must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  area?: string;

  @IsInt({ message: 'City ID must be a number' })
  @Type(() => Number)
  cityId: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class UpdatePincodeDto {
  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @MinLength(3, { message: 'Code must be at least 3 characters long' })
  @MaxLength(10, { message: 'Code must not exceed 10 characters' })
  @Transform(({ value }) => value?.trim())
  code?: string;

  @IsOptional()
  @IsString({ message: 'Area must be a string' })
  @MaxLength(100, { message: 'Area must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  area?: string;

  @IsOptional()
  @IsInt({ message: 'City ID must be a number' })
  @Type(() => Number)
  cityId?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class PincodeResponseDto {
  id: string;
  code: string;
  area?: string | null;
  cityId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  city?: {
    id: number;
    name: string;
    state_id: number;
    state_code?: string | null;
    state_name?: string | null;
    country_id?: number | null;
    country_code?: string | null;
    country_name?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    wikiDataId?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
      state?: {
        id: number;
        name?: string | null;
        country_id?: number | null;
        state_id?: number | null;
      country_code?: string | null;
      country_name?: string | null;
      iso2?: string | null;
      fips_code?: string | null;
      type?: string | null;
      latitude?: string | null;
      longitude?: string | null;
      isActive: boolean;
      createdAt: Date;
      country?: {
        id: number;
        name: string | null;
        iso3?: string | null;
        iso2?: string | null;
        numeric_code?: string | null;
        phonecode?: string | null;
        capital?: string | null;
        currency?: string | null;
        currency_name?: string | null;
        currency_symbol?: string | null;
        tld?: string | null;
        native?: string | null;
        region?: string | null;
        region_id?: number | null;
        subregion?: string | null;
        subregion_id?: number | null;
        nationality?: string | null;
        latitude?: string | null;
        longitude?: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    };
  };
}
