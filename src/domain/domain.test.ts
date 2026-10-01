import { describe, expect, it } from "vitest";
import { exportBackup, importBackup, BackupError } from "./backup";
import { addDays, daysBetween, fmtToday, startOfWeek, todayISO } from "./dates";
import { adherence, nextDose } from "./dose";
import { kg, signedKg } from "./format";
import { buildReport } from "./report";
import { emptyData, type Dose, type TreatmentConfig } from "./types";

const config: TreatmentConfig = { medication: "Mounjaro (tirzepatida)", dose: 5, frequencyDays: 7, lastDoseDate: "2026-09-17" };
const dose = (date: string): Dose => ({ id: date, date, amount: 5, site: "", notes: "" });

describe("datas (TZ America/Sao_Paulo)", () => {
  it("às 22h40 de 29/09 ainda é dia 29 — o bug antigo dava 30", () => {
    const noite = new Date("2026-09-29T22:40:00-03:00");
    expect(noite.toISOString().slice(0, 10)).toBe("2026-09-30"); // o que a versão antiga fazia
    expect(todayISO(noite)).toBe("2026-09-29");
  });
  it("soma e diferença de dias atravessando meses", () => {
    expect(addDays("2026-09-24", 7)).toBe("2026-10-01");
    expect(daysBetween("2026-09-29", "2026-10-01")).toBe(2);
    expect(startOfWeek("2026-09-29")).toBe("2026-09-27");
  });
  it("data por extenso só com a primeira letra maiúscula", () => {
    expect(fmtToday(new Date("2026-09-29T10:00:00-03:00"))).toBe("Terça-feira, 29 de setembro");
  });
});

describe("próxima dose", () => {
  it("conta a partir da dose mais recente registrada", () => {
    const n = nextDose(config, [dose("2026-09-24")], "2026-09-29");
    expect(n.date).toBe("2026-10-01");
    expect(n.daysLeft).toBe(2);
    expect(n.overdue).toBe(false);
  });
  it("remover a última dose recalcula a próxima", () => {
    expect(nextDose(config, [], "2026-09-29")).toMatchObject({ date: "2026-09-24", daysLeft: -5, overdue: true });
  });
});

describe("adesão", () => {
  it("100% com uma dose por semana", () => {
    expect(adherence(config, [dose("2026-09-17"), dose("2026-09-24")], "2026-09-29")).toEqual({ taken: 2, expected: 2, pct: 100 });
  });
  it("cai quando falta dose", () => {
    expect(adherence(config, [dose("2026-09-01"), dose("2026-09-15")], "2026-09-29")?.pct).toBe(40);
  });
  it("sem doses não há adesão", () => {
    expect(adherence(config, [], "2026-09-29")).toBeNull();
  });
});

describe("relatório", () => {
  const data = {
    ...emptyData(),
    doses: [dose("2026-09-24"), dose("2026-07-01")],
    weights: [
      { id: "1", date: "2026-09-01", weight: 95, waist: null, hip: null, notes: "" },
      { id: "2", date: "2026-09-29", weight: 91.8, waist: null, hip: null, notes: "" },
    ],
    symptoms: [
      { id: "a", date: "2026-09-25", items: ["Náusea", "Fadiga"], severity: 3, notes: "" },
      { id: "b", date: "2026-09-26", items: ["Náusea"], severity: 2, notes: "" },
    ],
    waterDaily: { "2026-09-28": 2000, "2026-09-29": 1500, "2026-06-01": 9000 },
  };

  it("média de água usa os registros diários (antes dava sempre 0)", () => {
    const r = buildReport(data, "2026-09-29", 30);
    expect(r.avgWater).toBe(1750);
    expect(r.waterDaysLogged).toBe(2);
  });
  it("filtra pelo período e conta sintomas", () => {
    const r = buildReport(data, "2026-09-29", 30);
    expect(r.doses.map((d) => d.date)).toEqual(["2026-09-24"]);
    expect(r.weightChange).toBeCloseTo(-3.2);
    expect(r.symptomCounts).toEqual([["Náusea", 2], ["Fadiga", 1]]);
  });
});

describe("formatação", () => {
  it("usa vírgula decimal", () => {
    expect(kg(93.2)).toBe("93,2 kg");
    expect(signedKg(-3.2)).toBe("-3,2 kg");
    expect(signedKg(1)).toBe("+1 kg");
  });
});

describe("backup", () => {
  it("exporta e importa sem perder nada", () => {
    const data = { ...emptyData(), config, doses: [dose("2026-09-24")], waterDaily: { "2026-09-29": 750 } };
    expect(importBackup(exportBackup(data))).toEqual(data);
  });

  it("importa os dados da versão HTML antiga (metas dentro da config, água em lista)", () => {
    const legacy = JSON.stringify({
      config: { ...config, waterGoal: 2500, weightGoal: 80, proteinGoal: 100 },
      doses: [dose("2026-09-24")],
      weights: [], symptoms: [],
      water: [{ date: "2026-09-28", amount: 250 }, { date: "2026-09-28", amount: 500 }],
      waterDaily: { "2026-09-29": 1000 },
    });
    const d = importBackup(legacy);
    expect(d.config?.medication).toBe("Mounjaro (tirzepatida)");
    expect(d.goals).toEqual({ water: 2500, weight: 80, protein: 100 });
    expect(d.waterDaily).toEqual({ "2026-09-28": 750, "2026-09-29": 1000 });
  });

  it("descarta registros inválidos", () => {
    const d = importBackup(JSON.stringify({ doses: [{ date: "ontem" }, { date: "2026-09-01", amount: "x" }], weights: [{ date: "2026-09-01", weight: -1 }] }));
    expect(d.doses).toHaveLength(1);
    expect(d.doses[0].amount).toBe(0);
    expect(d.weights).toHaveLength(0);
  });

  it("recusa arquivos que não são backup", () => {
    expect(() => importBackup("não é json")).toThrow(BackupError);
    expect(() => importBackup(JSON.stringify({ foo: 1 }))).toThrow(/não parece ser um backup/);
  });
});
