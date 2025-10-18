import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class CandidateRegisterSimpleDto {
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Re-enter password must be a string' })
  @IsNotEmpty({ message: 'Re-enter password is required' })
  reenterPassword: string;
}
