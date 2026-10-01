/** Datas sempre como string YYYY-MM-DD no horário local do aparelho. */
export type ISODate = string;

export interface TreatmentConfig {
  medication: string;
  dose: number;
  frequencyDays: number;
  /** Última dose informada na configuração (antes de usar o app). */
  lastDoseDate: ISODate;
}

export interface Goals {
  /** ml por dia */
  water: number;
  /** kg */
  weight: number | null;
  /** g por dia */
  protein: number | null;
}

export interface Dose { id: string; date: ISODate; amount: number; site: string; notes: string }
export interface WeightEntry { id: string; date: ISODate; weight: number; waist: number | null; hip: number | null; notes: string }
export interface SymptomEntry { id: string; date: ISODate; items: string[]; severity: number | null; notes: string }
export type MealType = "Café da manhã" | "Almoço" | "Jantar" | "Lanche";
export interface Meal {
  id: string; date: ISODate; type: MealType | ""; description: string;
  calories: number; protein: number; carbs: number; fat: number;
}

/** Tudo que é salvo no aparelho e vai no backup. */
export interface AppData {
  version: 2;
  config: TreatmentConfig | null;
  goals: Goals;
  doses: Dose[];
  weights: WeightEntry[];
  symptoms: SymptomEntry[];
  /** Mililitros por dia: { "2026-09-29": 1500 } */
  waterDaily: Record<ISODate, number>;
  meals: Meal[];
}

export const emptyData = (): AppData => ({
  version: 2, config: null, goals: { water: 2000, weight: null, protein: null }, doses: [], weights: [], symptoms: [], waterDaily: {}, meals: [],
});

export const MEDICATIONS = [
  "Ozempic (semaglutida)",
  "Wegovy (semaglutida)",
  "Mounjaro (tirzepatida)",
  "Zepbound (tirzepatida)",
  "Saxenda (liraglutida)",
  "Outro",
] as const;
export const INJECTION_SITES = ["Abdômen", "Coxa", "Braço"] as const;
export const SYMPTOMS = ["Náusea", "Fadiga", "Constipação", "Diarreia", "Dor de cabeça", "Tontura", "Refluxo", "Outro"] as const;
export const MEAL_TYPES: { key: MealType; icon: string }[] = [
  { key: "Café da manhã", icon: "☕" },
  { key: "Almoço", icon: "🥗" },
  { key: "Jantar", icon: "🍲" },
  { key: "Lanche", icon: "🍎" },
];
