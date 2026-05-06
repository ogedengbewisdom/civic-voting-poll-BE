import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from '../../../common/decorators/role.decorator';
import { IJwtPayload, UserRole } from '../../../common/interface/jwt.payload';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const required_roles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );
    // return true;
    if (!required_roles) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const user = req.user as IJwtPayload;

    if (!user) throw new UnauthorizedException('User not found');

    const user_role = user.role;

    const allowed_roles = required_roles.includes(user_role);

    if (!allowed_roles) throw new ForbiddenException('Access denied');

    return true;
  }
}
