import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCountryDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'ISO3 must be a string' })
  @MaxLength(3, { message: 'ISO3 must not exceed 3 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  iso3?: string;

  @IsOptional()
  @IsString({ message: 'ISO2 must be a string' })
  @MaxLength(2, { message: 'ISO2 must not exceed 2 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  iso2?: string;

  @IsOptional()
  @IsString({ message: 'Numeric code must be a string' })
  numeric_code?: string;

  @IsOptional()
  @IsString({ message: 'Phone code must be a string' })
  phonecode?: string;

  @IsOptional()
  @IsString({ message: 'Capital must be a string' })
  capital?: string;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;

  @IsOptional()
  @IsString({ message: 'Currency name must be a string' })
  currency_name?: string;

  @IsOptional()
  @IsString({ message: 'Currency symbol must be a string' })
  currency_symbol?: string;

  @IsOptional()
  @IsString({ message: 'TLD must be a string' })
  tld?: string;

  @IsOptional()
  @IsString({ message: 'Native must be a string' })
  native?: string;

  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Region ID must be a number' })
  region_id?: number;

  @IsOptional()
  @IsString({ message: 'Subregion must be a string' })
  subregion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Subregion ID must be a number' })
  subregion_id?: number;

  @IsOptional()
  @IsString({ message: 'Nationality must be a string' })
  nationality?: string;

  @IsOptional()
  @IsString({ message: 'Latitude must be a string' })
  latitude?: string;

  @IsOptional()
  @IsString({ message: 'Longitude must be a string' })
  longitude?: string;

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
  @IsString({ message: 'ISO3 must be a string' })
  @MaxLength(3, { message: 'ISO3 must not exceed 3 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  iso3?: string;

  @IsOptional()
  @IsString({ message: 'ISO2 must be a string' })
  @MaxLength(2, { message: 'ISO2 must not exceed 2 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  iso2?: string;

  @IsOptional()
  @IsString({ message: 'Numeric code must be a string' })
  numeric_code?: string;

  @IsOptional()
  @IsString({ message: 'Phone code must be a string' })
  phonecode?: string;

  @IsOptional()
  @IsString({ message: 'Capital must be a string' })
  capital?: string;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;

  @IsOptional()
  @IsString({ message: 'Currency name must be a string' })
  currency_name?: string;

  @IsOptional()
  @IsString({ message: 'Currency symbol must be a string' })
  currency_symbol?: string;

  @IsOptional()
  @IsString({ message: 'TLD must be a string' })
  tld?: string;

  @IsOptional()
  @IsString({ message: 'Native must be a string' })
  native?: string;

  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Region ID must be a number' })
  region_id?: number;

  @IsOptional()
  @IsString({ message: 'Subregion must be a string' })
  subregion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Subregion ID must be a number' })
  subregion_id?: number;

  @IsOptional()
  @IsString({ message: 'Nationality must be a string' })
  nationality?: string;

  @IsOptional()
  @IsString({ message: 'Latitude must be a string' })
  latitude?: string;

  @IsOptional()
  @IsString({ message: 'Longitude must be a string' })
  longitude?: string;

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
    name: string | null;
    country_id: number | null;
    country_code?: string | null;
    country_name?: string | null;
    iso2?: string | null;
    fips_code?: string | null;
    type?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    isActive: boolean;
    createdAt: Date;
  }[];
}
