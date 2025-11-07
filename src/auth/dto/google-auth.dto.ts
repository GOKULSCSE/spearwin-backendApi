import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Google ID must be a string' })
  @IsNotEmpty({ message: 'Google ID is required' })
  googleId: string;

  @IsString({ message: 'Access token must be a string' })
  @IsNotEmpty({ message: 'Access token is required' })
  accessToken: string;

  @IsString({ message: 'ID token must be a string' })
  @IsOptional()
  idToken?: string;

  @IsString({ message: 'Picture URL must be a string' })
  @IsOptional()
  picture?: string;
}

