import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsString({ message: 'City ID must be a string' })
  cityId: string;

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
  @IsString({ message: 'City ID must be a string' })
  cityId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;
}

export class PincodeResponseDto {
  id: string;
  code: string;
  area?: string | null;
  cityId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  city?: {
    id: string;
    name: string;
    state: {
      id: string;
      name: string;
      code?: string | null;
      country: {
        id: string;
        name: string;
        code: string;
      };
    };
  };
}
