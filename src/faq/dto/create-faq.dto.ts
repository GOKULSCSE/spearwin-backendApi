import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFaqDto {
  @IsString({ message: 'Question must be a string' })
  @MinLength(5, { message: 'Question must be at least 5 characters long' })
  @MaxLength(500, { message: 'Question must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  question: string;

  @IsString({ message: 'Answer must be a string' })
  @MinLength(10, { message: 'Answer must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Answer must not exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  answer: string;

  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean value' })
  active?: boolean = false;
}
