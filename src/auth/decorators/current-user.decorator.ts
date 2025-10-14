import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  twoFactorEnabled: boolean;
}

export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
