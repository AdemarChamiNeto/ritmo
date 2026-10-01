import { get } from "idb-keyval";
import { describe, expect, it, vi } from "vitest";
import { nextDose } from "../domain/dose";
import { emptyData } from "../domain/types";
import { makeStore } from "./index";
import { configSaved, dataReplaced, doseAdded, doseRemoved, goalSet, waterSet } from "./dataSlice";
import { loadData } from "./persistence";
import { nutritionDateChanged } from "./uiSlice";

describe("dataSlice", () => {
  it("adicionar e remover dose recalcula a próxima", () => {
    const store = makeStore(undefined, false);
    store.dispatch(configSaved({ medication: "Ozempic (semaglutida)", dose: 0.5, frequencyDays: 7, lastDoseDate: "2026-09-10" }));
    store.dispatch(doseAdded({ date: "2026-09-24", amount: 0.5, site: "Coxa", notes: "" }));
    const s1 = store.getState().data;
    expect(nextDose(s1.config!, s1.doses, "2026-09-29").date).toBe("2026-10-01");

    store.dispatch(doseRemoved(s1.doses[0].id));
    const s2 = store.getState().data;
    expect(nextDose(s2.config!, s2.doses, "2026-09-29").date).toBe("2026-09-17");
  });

  it("água zerada remove o dia; meta inválida volta ao padrão", () => {
    const store = makeStore(undefined, false);
    store.dispatch(waterSet({ date: "2026-09-29", ml: 500 }));
    store.dispatch(waterSet({ date: "2026-09-29", ml: 0 }));
    expect(store.getState().data.waterDaily).toEqual({});
    store.dispatch(goalSet({ goal: "water", value: null }));
    expect(store.getState().data.goals.water).toBe(2000);
    store.dispatch(goalSet({ goal: "protein", value: 110 }));
    expect(store.getState().data.goals.protein).toBe(110);
  });

  it("não deixa escolher dia futuro na nutrição", () => {
    const store = makeStore(undefined, false);
    const before = store.getState().ui.nutritionDate;
    store.dispatch(nutritionDateChanged("2999-01-01"));
    expect(store.getState().ui.nutritionDate).toBe(before);
  });
});

describe("persistência (IndexedDB)", () => {
  it("salva automaticamente e carrega de volta", async () => {
    vi.useFakeTimers();
    const store = makeStore();
    store.dispatch(dataReplaced({ ...emptyData(), waterDaily: { "2026-09-29": 1250 } }));
    await vi.advanceTimersByTimeAsync(300);
    vi.useRealTimers();
    await vi.waitFor(async () => expect(await get("ritmo-data-v2")).toBeTruthy());
    expect((await loadData())?.waterDaily).toEqual({ "2026-09-29": 1250 });
  });
});

describe("migração da versão HTML", () => {
  it("importa do localStorage antigo e já grava no IndexedDB", async () => {
    const { clear } = await import("idb-keyval");
    await clear();
    localStorage.setItem("ritmo_treatment_data_v1", JSON.stringify({ config: null, doses: [{ id: "x", date: "2026-09-01", amount: 1 }], weights: [], symptoms: [], water: [] }));
    const data = await loadData();
    expect(data?.doses).toHaveLength(1);
    expect((await get("ritmo-data-v2"))?.doses).toHaveLength(1);
    localStorage.clear();
  });
});
