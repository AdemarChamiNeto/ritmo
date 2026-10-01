import { useState } from "react";
import ChipGroup from "../components/ChipGroup";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { INJECTION_SITES } from "../domain/types";
import { useAppDispatch, useAppSelector } from "../store";
import { doseAdded } from "../store/dataSlice";
import { parseNum, type FormProps } from "./util";

export default function DoseForm({ open, onClose }: FormProps) {
  return open ? <Body onClose={onClose} /> : null;
}

function Body({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => s.data.config);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState(config ? String(config.dose) : "");
  const [site, setSite] = useState<(typeof INJECTION_SITES)[number][]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function save() {
    const mg = parseNum(amount);
    if (mg == null || mg <= 0) return setError("Informe a dose em mg.");
    if (!date || date > todayISO()) return setError("A data não pode ser no futuro.");
    dispatch(doseAdded({ date, amount: mg, site: site[0] ?? "", notes: notes.trim() }));
    onClose();
  }

  return (
    <Modal open title="Registrar dose" onClose={onClose}
      actions={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar dose</button></>}>
      <Field label="Data"><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Dose (mg)"><input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <span className="label">Local da aplicação</span>
      <ChipGroup label="Local da aplicação" options={INJECTION_SITES} selected={site} onChange={setSite} />
      <Field label="Notas (opcional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como você se sentiu, reações..." /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
