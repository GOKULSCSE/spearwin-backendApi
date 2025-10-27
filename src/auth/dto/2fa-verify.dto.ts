import { IsString, IsNotEmpty } from 'class-validator';

export class Verify2FaDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}