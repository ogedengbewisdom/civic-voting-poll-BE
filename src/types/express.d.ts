declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      role: 'admin' | 'user';
      first_name: string;
      last_name: string;
      state_id: number;
      state: string;
    };
  }
}
