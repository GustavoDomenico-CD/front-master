export interface User {
  id: number | string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user' | 'manager' | string;
  name?: string;
  avatar_url?: string;
  permissions?: string[];
  is_active?: boolean;
  last_login?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'user' | 'manager';