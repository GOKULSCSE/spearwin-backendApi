import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);

    if (!payload || !payload.sub) {
      this.logger.warn('Invalid JWT payload: missing sub field');
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.authService.validateUserById(payload.sub);

      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (user.status === UserStatus.SUSPENDED) {
        this.logger.warn(`Account suspended for user: ${user.email}`);
        throw new UnauthorizedException('Account is suspended');
      }

      if (user.status === UserStatus.INACTIVE) {
        this.logger.warn(`Account inactive for user: ${user.email}`);
        throw new UnauthorizedException('Account is inactive');
      }

      this.logger.debug(`Successfully validated user: ${user.email}`);
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        profileCompleted: user.profileCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
      };
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`);
      throw error;
    }
  }
}
