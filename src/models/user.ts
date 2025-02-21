export type User = {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials & {
  displayName?: string;
};
