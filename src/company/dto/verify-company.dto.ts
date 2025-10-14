import { IsBoolean } from 'class-validator';

export class VerifyCompanyDto {
  @IsBoolean({ message: 'Is verified must be a boolean value' })
  isVerified: boolean;
}
