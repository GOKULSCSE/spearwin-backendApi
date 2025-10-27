import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class VerifyCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsBoolean()
  isVerified: boolean;
}