import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interface/jwt.payload';

export const ROLE_KEY = 'allowed_roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);
