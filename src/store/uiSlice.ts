import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { todayISO } from "../domain/dates";
import type { ISODate } from "../domain/types";

export type Tab = "inicio" | "doses" | "peso" | "sintomas" | "agua" | "nutricao" | "relatorio" | "ajustes";

export interface UiState { tab: Tab; nutritionDate: ISODate; reportDays: 30 | 60 | 90 }

export const uiSlice = createSlice({
  name: "ui",
  initialState: (): UiState => ({ tab: "inicio", nutritionDate: todayISO(), reportDays: 30 }),
  reducers: {
    tabChanged(state, action: PayloadAction<Tab>) {
      state.tab = action.payload;
    },
    nutritionDateChanged(state, action: PayloadAction<ISODate>) {
      if (action.payload <= todayISO()) state.nutritionDate = action.payload;
    },
    reportDaysChanged(state, action: PayloadAction<UiState["reportDays"]>) {
      state.reportDays = action.payload;
    },
  },
});

export const { tabChanged, nutritionDateChanged, reportDaysChanged } = uiSlice.actions;
