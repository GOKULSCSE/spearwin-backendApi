import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Slug must be a string' })
  @MinLength(2, { message: 'Slug must be at least 2 characters long' })
  @MaxLength(50, { message: 'Slug must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-'))
  slug: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;

  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  industry?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Founded year must be a number' })
  foundedYear?: number;

  @IsOptional()
  @IsString({ message: 'Employee count must be a string' })
  employeeCount?: string;

  @IsOptional()
  @IsString({ message: 'Headquarters must be a string' })
  headquarters?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL must be a valid URL' })
  twitterUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Facebook URL must be a valid URL' })
  facebookUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is verified must be a boolean value' })
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}
