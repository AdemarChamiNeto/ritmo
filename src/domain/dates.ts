import type { ISODate } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Data local (não UTC!) no formato YYYY-MM-DD. */
export const toISODate = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Hoje no horário do aparelho. A versão antiga usava `toISOString()`, que é UTC:
 * no Brasil (UTC-3), das 21h à meia-noite o app achava que já era o dia seguinte.
 */
export const todayISO = (now = new Date()): ISODate => toISODate(now);

/** Meio-dia local evita surpresas com horário de verão ao somar dias. */
const parse = (iso: ISODate) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

export const addDays = (iso: ISODate, n: number): ISODate => {
  const d = parse(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

export const daysBetween = (a: ISODate, b: ISODate) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86_400_000);

/** Domingo da semana da data. */
export const startOfWeek = (iso: ISODate): ISODate => addDays(iso, -parse(iso).getDay());

export const fmtDate = (iso: ISODate) => iso.split("-").reverse().join("/");

export const fmtDateLong = (iso: ISODate) =>
  parse(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

/** "terça-feira, 29 de setembro" — só a primeira letra maiúscula. */
export const fmtToday = (now = new Date()) => {
  const s = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const weekdayShort = (iso: ISODate) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][parse(iso).getDay()];
