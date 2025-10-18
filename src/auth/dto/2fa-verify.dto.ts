import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class Verify2FaDto {
  @IsString({ message: '2FA code must be a string' })
  @IsNotEmpty({ message: '2FA code is required' })
  code: string;

  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
