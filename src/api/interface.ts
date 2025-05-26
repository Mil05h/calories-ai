import { User, LoginCredentials, RegisterCredentials } from "../models/user";
import { MealWithoutId } from "../models/meal";

export type MealAnalysisInput = {
  description?: string;
  imageBase64?: string;
};

export type NutritionAnalysis = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export interface IAPI {
  login(credentials: LoginCredentials): Promise<User>;
  register(credentials: RegisterCredentials): Promise<User>;
  logout(): Promise<void>;
  requireUser(): Promise<User>;
  sendPasswordResetEmail(email: string): Promise<void>;
  loginWithGoogle(): Promise<User>;
  addMeal(meal: MealWithoutId): Promise<string>;
  analyzeMealNutrition(input: MealAnalysisInput): Promise<NutritionAnalysis>;
}
