import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum OTPType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_AUTH = 'TWO_FACTOR_AUTH',
}

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(OTPType)
  type: OTPType;
}