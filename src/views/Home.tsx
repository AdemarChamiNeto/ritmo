import { useState } from "react";
import LineChart from "../components/LineChart";
import Progress from "../components/Progress";
import Ring from "../components/Ring";
import WaterCups from "../components/WaterCups";
import { fmtDate, fmtDateLong } from "../domain/dates";
import { adherence, nextDose } from "../domain/dose";
import { kg, ml, num, signedKg } from "../domain/format";
import { mealsOn, sumMacros } from "../domain/nutrition";
import ConfigForm from "../forms/ConfigForm";
import DoseForm from "../forms/DoseForm";
import MealForm from "../forms/MealForm";
import WeightForm from "../forms/WeightForm";
import { useAppDispatch, useAppSelector } from "../store";
import { waterSet } from "../store/dataSlice";
import { selectSymptomsDesc, selectWeightsAsc } from "../store/selectors";
import { useToday } from "../useToday";

type Open = null | "config" | "dose" | "weight" | "meal";

export default function Home() {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { config, doses, goals, waterDaily, meals } = useAppSelector((s) => s.data);
  const weights = useAppSelector(selectWeightsAsc);
  const symptoms = useAppSelector(selectSymptomsDesc);
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);

  const next = config ? nextDose(config, doses, today) : null;
  const adh = config ? adherence(config, doses, today) : null;
  const water = waterDaily[today] ?? 0;
  const todayMacros = sumMacros(mealsOn(meals, today));
  const lastWeight = weights.at(-1);

  return (
    <section className="view" aria-labelledby="home-title">
      <h1 id="home-title" className="sr-only">Início</h1>

      <div className={`hero${next?.overdue ? " overdue" : ""}`}>
        <div className="hero-top">
          <div>
            <div className="label">Próxima dose</div>
            <div className="value">
              {!next ? "—" : next.overdue ? `Atrasada ${Math.abs(next.daysLeft)} dia${Math.abs(next.daysLeft) === 1 ? "" : "s"}`
                : next.daysLeft === 0 ? "Hoje" : `Em ${next.daysLeft} dia${next.daysLeft === 1 ? "" : "s"}`}
            </div>
            <div className="sub">
              {config && next ? `${config.medication} · ${num(config.dose, 2)} mg · ${fmtDateLong(next.date)}` : "Configure seu tratamento para começar."}
            </div>
          </div>
          {next && (
            <Ring pct={next.overdue ? 1 : next.progress} size={84} color={next.overdue ? "var(--danger)" : "var(--accent)"}
              label={`${Math.round(next.progress * 100)}% do intervalo entre doses`}>
              <text x="42" y="41" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-display)">{Math.abs(next.daysLeft)}</text>
              <text x="42" y="56" textAnchor="middle" fontSize="8.5" fill="var(--muted)">{next.overdue ? "dias atr." : next.daysLeft === 1 ? "dia" : "dias"}</text>
            </Ring>
          )}
        </div>
        <div className="btn-row">
          <button className="btn btn-light" onClick={() => setOpen(config ? "dose" : "config")}>Registrar dose</button>
          <button className="btn btn-light" onClick={() => setOpen("config")}>{config ? "Ajustar tratamento" : "Configurar tratamento"}</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="stat">
          <div className="num">{weights.length >= 2 ? signedKg(weights.at(-1)!.weight - weights[0].weight) : "—"}</div>
          <div className="cap">variação de peso</div>
        </div>
        <div className="stat">
          <div className="num">{adh ? `${adh.pct}%` : "—"}</div>
          <div className="cap">{adh ? `adesão · ${adh.taken} de ${adh.expected} doses` : "adesão às doses"}</div>
        </div>
      </div>

      <div className="card mt">
        <h2>Peso</h2>
        <div className="weight-vs-goal">
          <div><div className="wvg-label">Atual</div><div className="wvg-value">{lastWeight ? kg(lastWeight.weight) : "— kg"}</div></div>
          <div><div className="wvg-label">Meta</div><div className="wvg-value">{goals.weight ? kg(goals.weight) : "— kg"}</div></div>
          <button className="btn btn-ghost btn-round" aria-label="Registrar peso" onClick={() => setOpen("weight")}>+</button>
        </div>
        {lastWeight && goals.weight && (
          <p className="hint">{lastWeight.weight > goals.weight ? `Faltam ${kg(lastWeight.weight - goals.weight)} para a meta.` : "Meta de peso atingida! 🎉"}</p>
        )}
        <div style={{ marginTop: 10 }}>
          <LineChart values={weights.slice(-8).map((w) => w.weight)} height={80} goal={goals.weight} ariaLabel="Evolução recente do peso" />
        </div>
      </div>

      <div className="card">
        <h2>Água de hoje</h2>
        <div className="ring-wrap" style={{ marginBottom: 12 }}>
          <Ring pct={water / goals.water} label={`${Math.round((water / goals.water) * 100)}% da meta de água`} />
          <div>
            <div className="ring-num">{ml(water)}</div>
            <div className="cap">meta: {ml(goals.water)}</div>
          </div>
        </div>
        <WaterCups total={water} goal={goals.water} onSet={(v) => dispatch(waterSet({ date: today, ml: v }))} />
      </div>

      <div className="card">
        <h2>Nutrição de hoje</h2>
        <div className="grid-2">
          <div className="stat"><div className="num">{num(todayMacros.calories, 0)}</div><div className="cap">calorias</div></div>
          <div className="stat">
            <div className="num">{num(todayMacros.protein, 0)} g</div>
            <div className="cap">proteína{goals.protein ? ` · meta ${goals.protein} g` : ""}</div>
            {goals.protein && <Progress value={todayMacros.protein} max={goals.protein} label="Proteína do dia em relação à meta" />}
          </div>
        </div>
        <button className="btn btn-ghost btn-block mt" onClick={() => setOpen("meal")}>Registrar refeição</button>
      </div>

      <div className="card">
        <h2>Sintomas recentes</h2>
        {symptoms.length ? symptoms.slice(0, 3).map((s) => (
          <div className="history-item" key={s.id}>
            <div>
              <div className="title">{s.items.join(", ")}{s.severity ? ` · ${s.severity}/5` : ""}</div>
              <div className="meta">{fmtDate(s.date)}</div>
            </div>
          </div>
        )) : <p className="empty">Nenhum sintoma registrado ainda.</p>}
      </div>

      <ConfigForm open={open === "config"} onClose={close} />
      <DoseForm open={open === "dose"} onClose={close} />
      <WeightForm open={open === "weight"} onClose={close} />
      <MealForm open={open === "meal"} onClose={close} />
    </section>
  );
}
