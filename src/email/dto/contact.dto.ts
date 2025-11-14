import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ContactDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsString({ message: 'Service must be a string' })
  @IsNotEmpty({ message: 'Service is required' })
  service: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  message: string;

  @IsOptional()
  @IsString({ message: 'Remarks must be a string' })
  remarks?: string;
}

