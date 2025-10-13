import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OTPType } from '@prisma/client';

export class ResendOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsEnum(OTPType, { message: 'OTP type must be a valid type' })
  @IsNotEmpty({ message: 'OTP type is required' })
  type: OTPType;
}
