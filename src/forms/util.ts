/** Aceita "93,2" e "93.2". Vazio/ inválido → null. */
export function parseNum(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
export interface FormProps { open: boolean; onClose: () => void }
