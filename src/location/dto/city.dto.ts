import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCityDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'State ID must be a string' })
  stateId: string;

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
  @IsString({ message: 'State ID must be a string' })
  stateId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class CityResponseDto {
  id: string;
  name: string;
  stateId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  state?: {
    id: string;
    name: string;
    code?: string | null;
    country: {
      id: string;
      name: string;
      code: string;
    };
  };
  pincodes?: {
    id: string;
    code: string;
    area?: string | null;
    cityId: string;
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
  @IsString({ message: 'State ID must be a string' })
  stateId?: string;

  @IsOptional()
  @IsString({ message: 'Country ID must be a string' })
  countryId?: string;
}
