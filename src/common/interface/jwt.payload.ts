export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IJwtPayload {
  id: number;
  email: string;
  role: UserRole;
}
