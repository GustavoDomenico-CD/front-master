export interface User {
  id: number | string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'manager' | string;
  name?: string;
  avatar_url?: string;
  permissions?: string[];
  is_active?: boolean;
  last_login?: string;
}

export type UserRole = 'admin' | 'user' | 'manager';