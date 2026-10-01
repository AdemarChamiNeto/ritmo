import { useState } from "react";
import RemoveButton from "../components/RemoveButton";
import { fmtDate } from "../domain/dates";
import SymptomForm from "../forms/SymptomForm";
import { useAppDispatch, useAppSelector } from "../store";
import { symptomRemoved } from "../store/dataSlice";
import { selectSymptomsDesc } from "../store/selectors";

export default function Symptoms() {
  const dispatch = useAppDispatch();
  const symptoms = useAppSelector(selectSymptomsDesc);
  const [open, setOpen] = useState(false);
  return (
    <section className="view">
      <h1 className="page-title">Sintomas</h1>
      <button className="btn btn-primary btn-block" onClick={() => setOpen(true)}>Registrar sintoma</button>
      <div className="card mt">
        <h2>Histórico</h2>
        {symptoms.length ? symptoms.map((s) => (
          <div className="history-item" key={s.id}>
            <div>
              <div className="title">{s.items.join(", ")}{s.severity ? ` · intensidade ${s.severity}/5` : ""}</div>
              <div className="meta">{fmtDate(s.date)}</div>
              {s.notes && <div className="note">{s.notes}</div>}
            </div>
            <RemoveButton what={`sintoma de ${fmtDate(s.date)}`} onConfirm={() => dispatch(symptomRemoved(s.id))} />
          </div>
        )) : <p className="empty">Nenhum sintoma registrado ainda.</p>}
      </div>
      <SymptomForm open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
