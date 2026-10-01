import { useState } from "react";
import Ring from "../components/Ring";
import WaterCups from "../components/WaterCups";
import { addDays, weekdayShort } from "../domain/dates";
import { ml } from "../domain/format";
import WaterForm from "../forms/WaterForm";
import { useAppDispatch, useAppSelector } from "../store";
import { goalSet, waterSet } from "../store/dataSlice";
import { useToday } from "../useToday";
import GoalInput from "./GoalInput";

export default function Water() {
  const dispatch = useAppDispatch();
  const today = useToday();
  const waterDaily = useAppSelector((s) => s.data.waterDaily);
  const goal = useAppSelector((s) => s.data.goals.water);
  const [open, setOpen] = useState(false);
  const total = waterDaily[today] ?? 0;

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const totals = week.map((d) => waterDaily[d] ?? 0);
  const max = Math.max(goal, ...totals, 1);
  const w = 300, h = 120, slot = (w - 16) / 7, barW = slot - 10;

  return (
    <section className="view">
      <h1 className="page-title">Água</h1>
      <div className="card">
        <h2>Hoje</h2>
        <div className="ring-wrap">
          <Ring pct={total / goal} size={86} label={`${Math.round((total / goal) * 100)}% da meta de água`} />
          <div>
            <div className="ring-num">{ml(total)}</div>
            <div className="cap">meta: {ml(goal)}{total >= goal ? " · atingida ✓" : ""}</div>
          </div>
        </div>
        <p className="hint" style={{ margin: "14px 0 8px" }}>Toque nos copos conforme for bebendo (250 ml cada).</p>
        <WaterCups total={total} goal={goal} onSet={(v) => dispatch(waterSet({ date: today, ml: v }))} />
        <button className="btn btn-outline mt" onClick={() => setOpen(true)}>Quantidade específica</button>
      </div>

      <div className="card">
        <h2>Últimos 7 dias</h2>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img"
          aria-label={`Água nos últimos 7 dias: ${week.map((d, i) => `${weekdayShort(d)} ${totals[i]} ml`).join(", ")}`}>
          <line x1="8" x2={w - 8} y1={h - 22 - (goal / max) * (h - 30)} y2={h - 22 - (goal / max) * (h - 30)} stroke="var(--accent)" strokeDasharray="4 4" />
          {week.map((d, i) => {
            const barH = (totals[i] / max) * (h - 30);
            const x = 8 + i * slot + 5;
            return (
              <g key={d}>
                <rect x={x} y={h - 22 - barH} width={barW} height={Math.max(barH, 1)} rx="3" fill={totals[i] >= goal ? "var(--accent)" : "var(--border)"} />
                <text x={x + barW / 2} y={h - 6} fontSize="9" fill={d === today ? "var(--ink)" : "var(--muted)"} textAnchor="middle">{weekdayShort(d)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="card">
        <h2>Meta diária</h2>
        <GoalInput label="Meta de água (ml)" value={goal} onSave={(v) => dispatch(goalSet({ goal: "water", value: v }))} />
      </div>
      <WaterForm open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
