import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyStatusDto {
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}