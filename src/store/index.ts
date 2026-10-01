import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { AppData } from "../domain/types";
import { dataSlice } from "./dataSlice";
import { saveData } from "./persistence";
import { uiSlice } from "./uiSlice";

const rootReducer = combineReducers({ data: dataSlice.reducer, ui: uiSlice.reducer });
export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(initialData?: AppData, persist = true) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialData ? { data: initialData } : undefined,
  });

  if (persist) {
    // salva (com debounce) sempre que os dados mudarem — a UI não é persistida
    let last = store.getState().data;
    let timer: ReturnType<typeof setTimeout> | undefined;
    store.subscribe(() => {
      const data = store.getState().data;
      if (data === last) return;
      last = data;
      clearTimeout(timer);
      timer = setTimeout(() => saveData(data), 250);
    });
  }
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
