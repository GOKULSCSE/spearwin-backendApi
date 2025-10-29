import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CorsFriendlyThrottlerGuard extends ThrottlerGuard {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Skip throttling for OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return Promise.resolve(true);
    }
    
    return super.canActivate(context);
  }
}
