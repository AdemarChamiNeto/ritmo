import type { ISODate, Meal } from "./types";

export interface Macros { calories: number; protein: number; carbs: number; fat: number }

export const sumMacros = (meals: Meal[]): Macros =>
  meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

export const mealsOn = (meals: Meal[], date: ISODate) => meals.filter((m) => m.date === date);
