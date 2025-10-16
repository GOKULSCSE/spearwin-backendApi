import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCityDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsInt({ message: 'State ID must be a number' })
  @Type(() => Number)
  stateId: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsInt({ message: 'State ID must be a number' })
  @Type(() => Number)
  stateId?: number;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class CityResponseDto {
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
    country: {
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
    };
  };
  pincodes?: {
    id: string;
    code: string;
    area?: string | null;
    cityId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export class CitySearchQueryDto {
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsInt({ message: 'State ID must be a number' })
  @Type(() => Number)
  stateId?: number;

  @IsOptional()
  @IsInt({ message: 'Country ID must be a number' })
  @Type(() => Number)
  countryId?: number;

  @IsOptional()
  @IsInt({ message: 'Limit must be a number' })
  @Type(() => Number)
  limit?: number;
}
