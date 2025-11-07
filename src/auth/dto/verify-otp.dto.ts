import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'OTP code must be a string' })
  @IsNotEmpty({ message: 'OTP code is required' })
  otp: string;
}


