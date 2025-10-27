import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}