export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  password?: string; // Only used during auth/registration logic, not exposed effectively in real API scenarios
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string; // ISO Date string
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type ThemeColor = 'blue' | 'indigo' | 'slate';
