import { FirestoreDataConverter } from "firebase/firestore";
import { MealSchema, MealWithoutIdSchema, Meal, MealWithoutId } from "../models/meal";

export const mealConverter: FirestoreDataConverter<Meal, MealWithoutId> = {
  toFirestore(data) {
    const meal = MealWithoutIdSchema.parse(data);
    return meal;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return MealSchema.parse(data);
  },
};
