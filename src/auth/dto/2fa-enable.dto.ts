import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class Enable2FaDto {
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phone?: string;
}
