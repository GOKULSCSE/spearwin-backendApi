import { IsString, IsNotEmpty } from 'class-validator';

export class Disable2FaDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}