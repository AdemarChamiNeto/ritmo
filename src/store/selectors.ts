import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";

const byDateDesc = <T extends { date: string }>(list: T[]) => [...list].sort((a, b) => b.date.localeCompare(a.date));
const byDateAsc = <T extends { date: string }>(list: T[]) => [...list].sort((a, b) => a.date.localeCompare(b.date));

export const selectDosesDesc = createSelector([(s: RootState) => s.data.doses], byDateDesc);
export const selectWeightsAsc = createSelector([(s: RootState) => s.data.weights], byDateAsc);
export const selectSymptomsDesc = createSelector([(s: RootState) => s.data.symptoms], byDateDesc);
export const selectMealsDesc = createSelector([(s: RootState) => s.data.meals], byDateDesc);
