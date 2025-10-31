import { IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Invalid user status' })
  status: UserStatus;
}

