import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCountryDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Code must be a string' })
  @MinLength(2, { message: 'Code must be at least 2 characters long' })
  @MaxLength(3, { message: 'Code must not exceed 3 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class UpdateCountryDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @MinLength(2, { message: 'Code must be at least 2 characters long' })
  @MaxLength(3, { message: 'Code must not exceed 3 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  code?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class CountryResponseDto {
  id: number;
  name: string;
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
  states?: {
    id: number;
    name: string;
    country_id: number;
    country_code?: string | null;
    country_name?: string | null;
    iso2?: string | null;
    fips_code?: string | null;
    type?: string | null;
    level?: string | null;
    parent_id?: number | null;
    latitude?: string | null;
    longitude?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
