import { User } from 'firebase/auth';

export type LoginOpts = {
  email: string;
  password: string;
};

export type RegisterOpts = {
  email: string;
  password: string;
  displayName: string;
};

export interface IAPI {
  login(opts: LoginOpts): Promise<User>;
  register(opts: RegisterOpts): Promise<User>;
  logout(): Promise<void>;
  requireUser(): Promise<User>;
  sendPasswordResetEmail(email: string): Promise<void>;
} 