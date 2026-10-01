import { useState } from "react";
import Progress from "../components/Progress";
import RemoveButton from "../components/RemoveButton";
import { icons } from "../components/icons";
import { addDays, fmtDate, fmtDateLong, startOfWeek, weekdayShort } from "../domain/dates";
import { num } from "../domain/format";
import { mealsOn, sumMacros } from "../domain/nutrition";
import { MEAL_TYPES, type MealType } from "../domain/types";
import MealForm from "../forms/MealForm";
import { useAppDispatch, useAppSelector } from "../store";
import { goalSet, mealRemoved } from "../store/dataSlice";
import { selectMealsDesc } from "../store/selectors";
import { nutritionDateChanged } from "../store/uiSlice";
import { useToday } from "../useToday";
import GoalInput from "./GoalInput";

export default function Nutrition() {
  const dispatch = useAppDispatch();
  const today = useToday();
  const selected = useAppSelector((s) => s.ui.nutritionDate);
  const meals = useAppSelector(selectMealsDesc);
  const doses = useAppSelector((s) => s.data.doses);
  const proteinGoal = useAppSelector((s) => s.data.goals.protein);
  const [form, setForm] = useState<{ type?: MealType } | null>(null);

  const weekStart = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayMeals = mealsOn(meals, selected);
  const totals = sumMacros(dayMeals);
  const select = (d: string) => dispatch(nutritionDateChanged(d));

  return (
    <section className="view">
      <h1 className="page-title">Nutrição</h1>

      {/* antes só dava para ver a semana atual */}
      <div className="week-nav">
        <button className="icon-btn" aria-label="Semana anterior" onClick={() => select(addDays(weekStart, -7))}>{icons.prev}</button>
        <div className="day-strip" role="group" aria-label="Dias da semana">
          {days.map((d) => (
            <button key={d} className="day-chip" aria-pressed={d === selected} disabled={d > today} onClick={() => select(d)}
              aria-label={`${fmtDateLong(d)}${doses.some((x) => x.date === d) ? ", dia de dose" : ""}`}>
              <span className="d-label">{weekdayShort(d)}</span>
              <span className="d-num">{Number(d.slice(8))}</span>
              <span className="d-dose" aria-hidden="true">{doses.some((x) => x.date === d) ? "💉" : ""}</span>
            </button>
          ))}
        </div>
        <button className="icon-btn" aria-label="Próxima semana" disabled={addDays(weekStart, 7) > today}
          onClick={() => select(addDays(weekStart, 7) > today ? today : addDays(weekStart, 7))}>{icons.next}</button>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>{selected === today ? "Hoje" : fmtDateLong(selected)}</h2>
          {selected !== today && <button className="btn btn-outline" style={{ padding: "6px 10px" }} onClick={() => select(today)}>Hoje</button>}
        </div>
        <div className="grid-2">
          <div className="stat"><div className="num">{num(totals.calories, 0)}</div><div className="cap">calorias</div></div>
          <div className="stat">
            <div className="num">{num(totals.protein, 0)} g</div>
            <div className="cap">proteína{proteinGoal ? ` de ${proteinGoal} g` : ""}</div>
            {proteinGoal && <Progress value={totals.protein} max={proteinGoal} label="Proteína do dia em relação à meta" />}
          </div>
          <div className="stat"><div className="num">{num(totals.carbs, 0)} g</div><div className="cap">carboidratos</div></div>
          <div className="stat"><div className="num">{num(totals.fat, 0)} g</div><div className="cap">gordura</div></div>
        </div>
      </div>

      {MEAL_TYPES.map((mt) => {
        const items = dayMeals.filter((m) => m.type === mt.key);
        return (
          <div className="card" key={mt.key}>
            <div className="card-head">
              <h2><span aria-hidden="true">{mt.icon}</span>{mt.key}</h2>
              <button className="btn btn-ghost btn-round" aria-label={`Adicionar ${mt.key}`} onClick={() => setForm({ type: mt.key })}>+</button>
            </div>
            {items.length ? items.map((m) => (
              <div className="history-item" key={m.id}>
                <div>
                  <div className="title">{m.description || mt.key}</div>
                  <div className="meta">{num(m.calories, 0)} kcal · P {num(m.protein, 0)} g · C {num(m.carbs, 0)} g · G {num(m.fat, 0)} g</div>
                </div>
                <RemoveButton what={m.description || mt.key} onConfirm={() => dispatch(mealRemoved(m.id))} />
              </div>
            )) : <p className="empty" style={{ padding: "6px 0", textAlign: "left" }}>Nenhum registro</p>}
          </div>
        );
      })}

      <div className="card">
        <h2>Meta diária de proteína</h2>
        <GoalInput label="Proteína (g)" value={proteinGoal} onSave={(v) => dispatch(goalSet({ goal: "protein", value: v }))} />
      </div>

      <div className="card">
        <h2>Histórico completo</h2>
        {meals.length ? meals.slice(0, 50).map((m) => (
          <div className="history-item" key={m.id}>
            <div>
              <div className="title">{m.type && `${m.type} — `}{m.description || "Refeição"}</div>
              <div className="meta">{fmtDate(m.date)} · {num(m.calories, 0)} kcal · P {num(m.protein, 0)} g</div>
            </div>
            <RemoveButton what={m.description || "refeição"} onConfirm={() => dispatch(mealRemoved(m.id))} />
          </div>
        )) : <p className="empty">Nenhuma refeição registrada ainda.</p>}
      </div>

      <MealForm open={form !== null} onClose={() => setForm(null)} type={form?.type} date={selected} />
    </section>
  );
}
