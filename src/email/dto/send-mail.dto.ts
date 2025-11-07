import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class SendMailDto {
  @IsEmail({}, { message: 'Invalid email address' })
  to: string;

  @IsString({ message: 'Subject must be a string' })
  @MinLength(1, { message: 'Subject cannot be empty' })
  subject: string;

  @IsOptional()
  @IsString({ message: 'Text content must be a string' })
  text?: string;

  @IsOptional()
  @IsString({ message: 'HTML content must be a string' })
  html?: string;
}

