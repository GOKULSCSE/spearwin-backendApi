import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdatePermissionsDto {
  @IsString()
  adminId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
