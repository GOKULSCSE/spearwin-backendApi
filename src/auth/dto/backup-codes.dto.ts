import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateBackupCodesDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}