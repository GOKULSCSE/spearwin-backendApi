import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStateDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @MaxLength(10, { message: 'Code must not exceed 10 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  code?: string;

  @IsString({ message: 'Country ID must be a string' })
  countryId: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class UpdateStateDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @MaxLength(10, { message: 'Code must not exceed 10 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  code?: string;

  @IsOptional()
  @IsString({ message: 'Country ID must be a string' })
  countryId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class StateResponseDto {
  id: string;
  name: string;
  code?: string | null;
  countryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  country?: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  cities?: {
    id: string;
    name: string;
    stateId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
