import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class ContactDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @MaxLength(20, { message: 'Phone number is too long' })
  phone: string;

  @IsString({ message: 'Service must be a string' })
  @IsNotEmpty({ message: 'Service is required' })
  @MaxLength(100, { message: 'Service name is too long' })
  service: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(5000, { message: 'Message is too long (max 5000 characters)' })
  message: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Name is too long' })
  name?: string;
}

