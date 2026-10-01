import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import { emptyData, type AppData, type Dose, type Goals, type ISODate, type Meal, type SymptomEntry, type TreatmentConfig, type WeightEntry } from "../domain/types";

type New<T> = Omit<T, "id">;

export const dataSlice = createSlice({
  name: "data",
  initialState: emptyData(),
  reducers: {
    configSaved(state, action: PayloadAction<TreatmentConfig>) {
      state.config = action.payload;
    },
    goalSet(state, action: PayloadAction<{ goal: keyof Goals; value: number | null }>) {
      const { goal, value } = action.payload;
      if (goal === "water") state.goals.water = value && value > 0 ? value : 2000;
      else state.goals[goal] = value && value > 0 ? value : null;
    },

    doseAdded: { reducer: (s, a: PayloadAction<Dose>) => void s.doses.push(a.payload), prepare: (d: New<Dose>) => ({ payload: { ...d, id: nanoid() } }) },
    doseRemoved(state, action: PayloadAction<string>) {
      state.doses = state.doses.filter((d) => d.id !== action.payload);
    },

    weightAdded: { reducer: (s, a: PayloadAction<WeightEntry>) => void s.weights.push(a.payload), prepare: (w: New<WeightEntry>) => ({ payload: { ...w, id: nanoid() } }) },
    weightRemoved(state, action: PayloadAction<string>) {
      state.weights = state.weights.filter((w) => w.id !== action.payload);
    },

    symptomAdded: { reducer: (s, a: PayloadAction<SymptomEntry>) => void s.symptoms.push(a.payload), prepare: (x: New<SymptomEntry>) => ({ payload: { ...x, id: nanoid() } }) },
    symptomRemoved(state, action: PayloadAction<string>) {
      state.symptoms = state.symptoms.filter((s) => s.id !== action.payload);
    },

    waterSet(state, action: PayloadAction<{ date: ISODate; ml: number }>) {
      const { date, ml } = action.payload;
      if (ml > 0) state.waterDaily[date] = Math.round(ml);
      else delete state.waterDaily[date];
    },

    mealAdded: { reducer: (s, a: PayloadAction<Meal>) => void s.meals.push(a.payload), prepare: (m: New<Meal>) => ({ payload: { ...m, id: nanoid() } }) },
    mealRemoved(state, action: PayloadAction<string>) {
      state.meals = state.meals.filter((m) => m.id !== action.payload);
    },

    /** Substitui tudo (importação de backup). */
    dataReplaced: (_state, action: PayloadAction<AppData>) => action.payload,
    dataCleared: () => emptyData(),
  },
});

export const {
  configSaved, goalSet, doseAdded, doseRemoved, weightAdded, weightRemoved, symptomAdded, symptomRemoved,
  waterSet, mealAdded, mealRemoved, dataReplaced, dataCleared,
} = dataSlice.actions;
