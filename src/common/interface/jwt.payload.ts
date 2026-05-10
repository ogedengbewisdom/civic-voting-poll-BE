export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// export enum status {
//   ACTIVE = 'active',
//   SUSPENDED = 'suspended',
// }

export interface IJwtPayload {
  sub: number;
  first_name: string;
  last_name: string;
  email: string;
  state: string;
  state_id: number;
  role: UserRole;
}

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  state: string;
  state_id: number;
  role: UserRole;
}
