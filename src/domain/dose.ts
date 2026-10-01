import { addDays, daysBetween } from "./dates";
import type { Dose, ISODate, TreatmentConfig } from "./types";

/**
 * Última dose = a mais recente entre as registradas e a informada na configuração.
 * É derivada (não gravada), então remover uma dose recalcula a próxima automaticamente.
 */
export function lastDoseDate(config: TreatmentConfig, doses: Dose[]): ISODate {
  return doses.reduce((max, d) => (d.date > max ? d.date : max), config.lastDoseDate);
}

export interface NextDose { date: ISODate; daysLeft: number; overdue: boolean; progress: number }

export function nextDose(config: TreatmentConfig, doses: Dose[], today: ISODate): NextDose {
  const date = addDays(lastDoseDate(config, doses), config.frequencyDays);
  const daysLeft = daysBetween(today, date);
  const elapsed = config.frequencyDays - daysLeft;
  return {
    date,
    daysLeft,
    overdue: daysLeft < 0,
    progress: Math.max(0, Math.min(1, elapsed / config.frequencyDays)),
  };
}

export interface Adherence { taken: number; expected: number; pct: number }

/**
 * Adesão = doses registradas ÷ doses esperadas desde a primeira dose registrada até hoje.
 * Ex.: semanal, primeira dose há 20 dias → esperadas 3 (dias 0, 7 e 14).
 */
export function adherence(config: TreatmentConfig, doses: Dose[], today: ISODate): Adherence | null {
  if (!doses.length) return null;
  const first = doses.reduce((min, d) => (d.date < min ? d.date : min), doses[0].date);
  const expected = Math.floor(Math.max(0, daysBetween(first, today)) / config.frequencyDays) + 1;
  const taken = new Set(doses.map((d) => d.date)).size;
  return { taken, expected, pct: Math.min(100, Math.round((taken / expected) * 100)) };
}
