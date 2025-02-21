import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  AuthError,
  User as FirebaseUser,
  connectAuthEmulator,
} from "firebase/auth";
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  Firestore,
} from 'firebase/firestore';
import { IAPI } from "./interface";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../models/user";

export type ApiErrorType = {
  code: string;
  message: string;
};

const createApiError = (code: string, message: string): ApiErrorType => ({
  code,
  message,
});

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email!,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
});

const handleFirebaseError = (error: unknown): never => {
  const authError = error as AuthError;

  switch (authError.code) {
    case "auth/user-not-found":
      throw createApiError("user-not-found", "User not found");
    case "auth/wrong-password":
    case "auth/invalid-email":
      throw createApiError("invalid-credentials", "Invalid email or password");
    case "auth/email-already-in-use":
      throw createApiError("email-already-in-use", "Email is already in use");
    default:
      throw createApiError(
        "operation-failed",
        authError.message || "Operation failed"
      );
  }
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export class API implements IAPI {
  private readonly app: FirebaseApp;
  private readonly auth: Auth;
  private readonly db: Firestore;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Connect to emulators in development
    if (import.meta.env.DEV) {
      connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.db, 'localhost', 8080);
      console.log('Connected to Firebase emulators');
    }
  }

  async login({ email, password }: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async register({
    email,
    password,
    displayName,
  }: RegisterCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      if (displayName) {
        try {
          await updateProfile(userCredential.user, {
            displayName,
          });
        } catch (error) {
          // If updating profile fails, we still want to return the user
          // but we should log the error
          console.error("Failed to update user profile:", error);
        }
      }

      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      const authError = error as AuthError;
      throw createApiError(
        "sign-out-failed",
        authError.message || "Failed to sign out"
      );
    }
  }

  async requireUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        this.auth,
        (user) => {
          unsubscribe();
          if (user) {
            resolve(mapFirebaseUser(user));
          } else {
            reject(
              createApiError("user-not-found", "No user is currently signed in")
            );
          }
        },
        (error) => {
          unsubscribe();
          reject(handleFirebaseError(error));
        }
      );
    });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }
}
