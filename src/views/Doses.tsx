import { useState } from "react";
import RemoveButton from "../components/RemoveButton";
import { fmtDate } from "../domain/dates";
import { num } from "../domain/format";
import ConfigForm from "../forms/ConfigForm";
import DoseForm from "../forms/DoseForm";
import { useAppDispatch, useAppSelector } from "../store";
import { doseRemoved } from "../store/dataSlice";
import { selectDosesDesc } from "../store/selectors";

export default function Doses() {
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => s.data.config);
  const doses = useAppSelector(selectDosesDesc);
  const [open, setOpen] = useState<null | "dose" | "config">(null);

  return (
    <section className="view">
      <h1 className="page-title">Doses</h1>
      <button className="btn btn-primary btn-block" onClick={() => setOpen(config ? "dose" : "config")}>Registrar nova dose</button>
      <div className="card mt">
        <h2>Histórico</h2>
        {doses.length ? doses.map((d) => (
          <div className="history-item" key={d.id}>
            <div>
              <div className="title">{num(d.amount, 2)} mg{d.site && ` · ${d.site}`}</div>
              <div className="meta">{fmtDate(d.date)}</div>
              {d.notes && <div className="note">{d.notes}</div>}
            </div>
            <RemoveButton what={`dose de ${fmtDate(d.date)}`} onConfirm={() => dispatch(doseRemoved(d.id))} />
          </div>
        )) : <p className="empty">Nenhuma dose registrada ainda.</p>}
      </div>
      <DoseForm open={open === "dose"} onClose={() => setOpen(null)} />
      <ConfigForm open={open === "config"} onClose={() => setOpen(null)} />
    </section>
  );
}
