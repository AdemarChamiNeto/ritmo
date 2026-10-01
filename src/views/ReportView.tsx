import { fmtDate, fmtDateLong } from "../domain/dates";
import { kg, ml, num, signedKg } from "../domain/format";
import { buildReport } from "../domain/report";
import { useAppDispatch, useAppSelector } from "../store";
import { reportDaysChanged, type UiState } from "../store/uiSlice";
import { useToday } from "../useToday";

const RANGES: UiState["reportDays"][] = [30, 60, 90];

export function ReportContent() {
  const today = useToday();
  const data = useAppSelector((s) => s.data);
  const days = useAppSelector((s) => s.ui.reportDays);
  const r = buildReport(data, today, days);
  const row = (k: string, v: string) => <div className="report-row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>;
  const none = (text: string) => <div className="report-row"><span className="k">{text}</span></div>;

  return (
    <>
      <div className="report-block">
        <h3>Resumo · {fmtDate(r.from)} a {fmtDate(r.to)} ({days} dias)</h3>
        {row("Medicamento", data.config ? `${data.config.medication} · ${num(data.config.dose, 2)} mg` : "—")}
        {row("Doses aplicadas", String(r.doses.length))}
        {row("Variação de peso", r.weightChange != null ? signedKg(r.weightChange) : "—")}
        {row("Média de água/dia", r.avgWater != null ? `${ml(r.avgWater)} (em ${r.waterDaysLogged} dias com registro)` : "sem registros")}
        {row("Média de proteína/dia", r.avgProtein != null ? `${r.avgProtein} g` : "sem registros")}
      </div>
      <div className="report-block">
        <h3>Sintomas no período</h3>
        {r.symptomCounts.length ? r.symptomCounts.map(([k, v]) => row(k, `${v}×`)) : none("Nenhum sintoma registrado")}
      </div>
      <div className="report-block">
        <h3>Doses registradas</h3>
        {r.doses.length ? r.doses.map((d) => row(fmtDate(d.date), `${num(d.amount, 2)} mg${d.site ? ` · ${d.site}` : ""}`)) : none("Nenhuma dose no período")}
      </div>
      <div className="report-block">
        <h3>Peso registrado</h3>
        {r.weights.length ? r.weights.map((w) => row(fmtDate(w.date), kg(w.weight))) : none("Nenhum registro no período")}
      </div>
    </>
  );
}

/** Versão só para impressão (fica escondida na tela). */
export function PrintReport() {
  const today = useToday();
  return (
    <div className="print-only" aria-hidden="true">
      <h1>Relatório de acompanhamento — Ritmo</h1>
      <p className="muted">Gerado em {fmtDateLong(today)}</p>
      <ReportContent />
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: 24 }}>
        Relatório gerado a partir de registros feitos pela própria pessoa em tratamento. Não substitui avaliação médica.
      </p>
    </div>
  );
}

export default function ReportView() {
  const dispatch = useAppDispatch();
  const days = useAppSelector((s) => s.ui.reportDays);
  return (
    <section className="view">
      <h1 className="page-title">Relatório para o médico</h1>
      <div className="card">
        <h2>Período</h2>
        <div className="segmented" role="group" aria-label="Período do relatório">
          {RANGES.map((d) => (
            <button key={d} aria-pressed={d === days} onClick={() => dispatch(reportDaysChanged(d))}>{d} dias</button>
          ))}
        </div>
        <button className="btn btn-primary btn-block mt" onClick={() => window.print()}>Imprimir / salvar em PDF</button>
      </div>
      <div className="card">
        <h2>Prévia</h2>
        <ReportContent />
      </div>
    </section>
  );
}
