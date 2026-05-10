import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { IJwtPayload } from '../../../common/interface/jwt.payload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt_service: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const is_public = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (is_public) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const header = req.headers['authorization'];

    if (!header)
      throw new UnauthorizedException('Authorization header is required');

    if (!header.startsWith('Bearer '))
      throw new UnauthorizedException('Invalid authorization header format');

    const token = header.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token is required');

    try {
      const payload: IJwtPayload = this.jwt_service.verify(token, {
        secret: process.env['JWT_SECRET'] as string,
      });

      req.user = {
        id: payload.sub,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        state: payload.state,
        state_id: payload.state_id,
        role: payload.role,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or token expired');
    }
  }
}
