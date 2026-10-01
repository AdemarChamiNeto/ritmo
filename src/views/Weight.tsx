import { useState } from "react";
import LineChart from "../components/LineChart";
import RemoveButton from "../components/RemoveButton";
import { fmtDate } from "../domain/dates";
import { kg, num } from "../domain/format";
import WeightForm from "../forms/WeightForm";
import { useAppDispatch, useAppSelector } from "../store";
import { goalSet, weightRemoved } from "../store/dataSlice";
import { selectWeightsAsc } from "../store/selectors";
import GoalInput from "./GoalInput";

export default function Weight() {
  const dispatch = useAppDispatch();
  const weights = useAppSelector(selectWeightsAsc);
  const goal = useAppSelector((s) => s.data.goals.weight);
  const [open, setOpen] = useState(false);

  return (
    <section className="view">
      <h1 className="page-title">Peso e medidas</h1>
      <button className="btn btn-primary btn-block" onClick={() => setOpen(true)}>Registrar peso</button>

      <div className="card mt">
        <h2>Evolução</h2>
        <LineChart
          values={weights.map((w) => w.weight)} goal={goal}
          labels={weights.length ? [fmtDate(weights[0].date), fmtDate(weights.at(-1)!.date)] : undefined}
          ariaLabel={`Gráfico de peso com ${weights.length} registros`}
        />
        {goal != null && <p className="hint">Linha tracejada: meta de {kg(goal)}.</p>}
      </div>

      <div className="card">
        <h2>Meta de peso</h2>
        <GoalInput label="Peso alvo (kg)" value={goal} onSave={(v) => dispatch(goalSet({ goal: "weight", value: v }))} />
      </div>

      <div className="card">
        <h2>Histórico</h2>
        {weights.length ? [...weights].reverse().map((w) => (
          <div className="history-item" key={w.id}>
            <div>
              <div className="title">{kg(w.weight)}</div>
              <div className="meta">
                {fmtDate(w.date)}{w.waist ? ` · cintura ${num(w.waist)} cm` : ""}{w.hip ? ` · quadril ${num(w.hip)} cm` : ""}
              </div>
              {w.notes && <div className="note">{w.notes}</div>}
            </div>
            <RemoveButton what={`peso de ${fmtDate(w.date)}`} onConfirm={() => dispatch(weightRemoved(w.id))} />
          </div>
        )) : <p className="empty">Nenhum registro ainda.</p>}
      </div>
      <WeightForm open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
