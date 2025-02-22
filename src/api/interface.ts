import { User, LoginCredentials, RegisterCredentials } from "../models/user";

export interface IAPI {
  login(credentials: LoginCredentials): Promise<User>;
  register(credentials: RegisterCredentials): Promise<User>;
  logout(): Promise<void>;
  requireUser(): Promise<User>;
  sendPasswordResetEmail(email: string): Promise<void>;
  loginWithGoogle(): Promise<User>;
}
