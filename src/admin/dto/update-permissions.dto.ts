import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class UpdatePermissionsDto {
  @IsString()
  @IsNotEmpty()
  adminId: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}