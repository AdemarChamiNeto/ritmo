import { emptyData, type AppData, type TreatmentConfig } from "./types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const numOr = <T>(v: unknown, fallback: T): number | T => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const date = (v: unknown) => (typeof v === "string" && DATE.test(v) ? v : null);
const id = (v: unknown) => (typeof v === "string" && v ? v : Math.random().toString(36).slice(2, 10));
const list = (v: unknown) => (Array.isArray(v) ? v.filter(isObj) : []);

export class BackupError extends Error {}

export function exportBackup(data: AppData, now = new Date()): string {
  return JSON.stringify({ app: "ritmo", exportedAt: now.toISOString(), data }, null, 2);
}

/**
 * Lê um backup e devolve dados válidos. Aceita:
 * - o arquivo exportado por este app ({ app: "ritmo", data });
 * - os dados crus da versão antiga em HTML (chave `ritmo_treatment_data_v1` do localStorage).
 * Registros inválidos são descartados em vez de quebrar o app.
 */
export function importBackup(text: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError("O arquivo não é um JSON válido.");
  }
  if (!isObj(parsed)) throw new BackupError("Formato de backup não reconhecido.");
  const raw = isObj(parsed.data) ? parsed.data : parsed;
  if (!("doses" in raw) && !("config" in raw)) throw new BackupError("Esse arquivo não parece ser um backup do Ritmo.");

  const out = emptyData();

  if (isObj(raw.config)) {
    const c = raw.config;
    const last = date(c.lastDoseDate);
    if (last && str(c.medication)) {
      const config: TreatmentConfig = {
        medication: str(c.medication),
        dose: numOr(c.dose, 0),
        frequencyDays: [1, 7, 14].includes(c.frequencyDays as number) ? (c.frequencyDays as number) : 7,
        lastDoseDate: last,
      };
      out.config = config;
    }
    // versão antiga guardava as metas dentro da config
    out.goals = {
      water: numOr(c.waterGoal, 2000),
      weight: numOr(c.weightGoal, null) || null,
      protein: numOr(c.proteinGoal, null) || null,
    };
  }
  if (isObj(raw.goals)) {
    out.goals = {
      water: numOr(raw.goals.water, 2000),
      weight: numOr(raw.goals.weight, null) || null,
      protein: numOr(raw.goals.protein, null) || null,
    };
  }

  out.doses = list(raw.doses).flatMap((d) => {
    const dt = date(d.date);
    return dt ? [{ id: id(d.id), date: dt, amount: numOr(d.amount, 0), site: str(d.site), notes: str(d.notes) }] : [];
  });
  out.weights = list(raw.weights).flatMap((w) => {
    const dt = date(w.date);
    const weight = numOr(w.weight, 0);
    return dt && weight > 0
      ? [{ id: id(w.id), date: dt, weight, waist: numOr(w.waist, null), hip: numOr(w.hip, null), notes: str(w.notes) }]
      : [];
  });
  out.symptoms = list(raw.symptoms).flatMap((s) => {
    const dt = date(s.date);
    const items = Array.isArray(s.items) ? s.items.filter((i): i is string => typeof i === "string") : [];
    return dt && items.length ? [{ id: id(s.id), date: dt, items, severity: numOr(s.severity, null), notes: str(s.notes) }] : [];
  });
  out.meals = list(raw.meals).flatMap((m) => {
    const dt = date(m.date);
    const type = ["Café da manhã", "Almoço", "Jantar", "Lanche"].includes(m.type as string) ? (m.type as AppData["meals"][number]["type"]) : "";
    return dt
      ? [{
          id: id(m.id), date: dt, type, description: str(m.description),
          calories: numOr(m.calories, 0), protein: numOr(m.protein, 0), carbs: numOr(m.carbs, 0), fat: numOr(m.fat, 0),
        }]
      : [];
  });

  if (isObj(raw.waterDaily)) {
    for (const [d, v] of Object.entries(raw.waterDaily)) {
      if (date(d) && typeof v === "number" && v > 0) out.waterDaily[d] = v;
    }
  }
  // formato mais antigo ainda: lista de { date, amount }
  for (const w of list(raw.water)) {
    const dt = date(w.date);
    const amount = numOr(w.amount, 0);
    if (dt && amount > 0) out.waterDaily[dt] = (out.waterDaily[dt] ?? 0) + amount;
  }

  return out;
}
