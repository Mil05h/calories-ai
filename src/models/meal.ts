import { z } from "zod";

export const MealSchema = z.object({
  id: z.string(),
  userId: z.string(),
  meal: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  dateAdded: z.string(),
});

export const MealWithoutIdSchema = MealSchema.omit({
    id: true,
});

export type Meal = z.infer<typeof MealSchema>;
export type MealWithoutId = z.infer<typeof MealWithoutIdSchema>;
