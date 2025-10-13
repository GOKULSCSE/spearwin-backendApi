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
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  states?: {
    id: string;
    name: string;
    code?: string | null;
    countryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
