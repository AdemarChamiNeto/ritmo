import { useState } from "react";
import ChipGroup from "../components/ChipGroup";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { SYMPTOMS } from "../domain/types";
import { useAppDispatch } from "../store";
import { symptomAdded } from "../store/dataSlice";
import type { FormProps } from "./util";

const LEVELS = ["1", "2", "3", "4", "5"] as const;

export default function SymptomForm({ open, onClose }: FormProps) {
  return open ? <Body onClose={onClose} /> : null;
}

function Body({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState<(typeof SYMPTOMS)[number][]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number][]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function save() {
    if (!items.length) return setError("Escolha pelo menos um sintoma.");
    if (!date || date > todayISO()) return setError("A data não pode ser no futuro.");
    dispatch(symptomAdded({ date, items, severity: level[0] ? Number(level[0]) : null, notes: notes.trim() }));
    onClose();
  }

  return (
    <Modal open title="Registrar sintoma" onClose={onClose}
      actions={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar</button></>}>
      <Field label="Data"><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></Field>
      <span className="label">Sintomas</span>
      <ChipGroup label="Sintomas" options={SYMPTOMS} selected={items} onChange={setItems} multiple />
      <span className="label">Intensidade (1 = leve, 5 = forte)</span>
      <ChipGroup label="Intensidade" options={LEVELS} selected={level} onChange={setLevel} className="sev-scale" />
      <Field label="Notas (opcional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
