import { IsNotEmpty, IsString } from 'class-validator';

export class Disable2FaDto {
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
