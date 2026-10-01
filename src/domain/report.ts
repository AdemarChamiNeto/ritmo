import { addDays } from "./dates";
import type { AppData, ISODate } from "./types";

export interface ReportSummary {
  from: ISODate;
  to: ISODate;
  days: number;
  doses: AppData["doses"];
  weights: AppData["weights"];
  weightChange: number | null;
  symptomCounts: [string, number][];
  /** Média de água nos dias em que houve registro (null se nenhum). */
  avgWater: number | null;
  waterDaysLogged: number;
  avgProtein: number | null;
}

export function buildReport(data: AppData, today: ISODate, days: number): ReportSummary {
  const from = addDays(today, -(days - 1));
  const inRange = (d: ISODate) => d >= from && d <= today;

  const doses = data.doses.filter((d) => inRange(d.date)).sort((a, b) => a.date.localeCompare(b.date));
  const weights = data.weights.filter((w) => inRange(w.date)).sort((a, b) => a.date.localeCompare(b.date));

  const counts = new Map<string, number>();
  for (const s of data.symptoms.filter((s) => inRange(s.date))) {
    for (const it of s.items) counts.set(it, (counts.get(it) ?? 0) + 1);
  }

  // A versão antiga lia `data.water` (vazio desde a migração) e sempre mostrava 0 ml.
  const water = Object.entries(data.waterDaily).filter(([d, v]) => inRange(d) && v > 0);
  const avgWater = water.length ? Math.round(water.reduce((s, [, v]) => s + v, 0) / water.length) : null;

  const mealDays = new Map<ISODate, number>();
  for (const m of data.meals.filter((m) => inRange(m.date))) mealDays.set(m.date, (mealDays.get(m.date) ?? 0) + m.protein);
  const avgProtein = mealDays.size ? Math.round([...mealDays.values()].reduce((a, b) => a + b, 0) / mealDays.size) : null;

  return {
    from, to: today, days, doses, weights,
    weightChange: weights.length >= 2 ? weights[weights.length - 1].weight - weights[0].weight : null,
    symptomCounts: [...counts.entries()].sort((a, b) => b[1] - a[1]),
    avgWater, waterDaysLogged: water.length, avgProtein,
  };
}
