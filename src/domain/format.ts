const nf = (digits: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits });

/** 93.2 → "93,2" */
export const num = (n: number, digits = 1) => nf(digits).format(n);
export const kg = (n: number) => `${num(n)} kg`;
export const signedKg = (n: number) => `${n > 0 ? "+" : ""}${num(n)} kg`;
export const ml = (n: number) => `${num(n, 0)} ml`;
