import { useState } from "react";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { useAppDispatch } from "../store";
import { weightAdded } from "../store/dataSlice";
import { parseNum, type FormProps } from "./util";

export default function WeightForm({ open, onClose }: FormProps) {
  return open ? <Body onClose={onClose} /> : null;
}

function Body({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function save() {
    const kg = parseNum(weight);
    // antes: peso vazio fechava o modal sem avisar nada
    if (kg == null || kg < 20 || kg > 400) return setError("Informe um peso válido em kg (ex.: 92,4).");
    if (!date || date > todayISO()) return setError("A data não pode ser no futuro.");
    dispatch(weightAdded({ date, weight: kg, waist: parseNum(waist), hip: parseNum(hip), notes: notes.trim() }));
    onClose();
  }

  return (
    <Modal open title="Registrar peso" onClose={onClose}
      actions={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar</button></>}>
      <Field label="Data"><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Peso (kg)"><input type="text" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
      <div className="grid-2">
        <Field label="Cintura (cm)"><input type="text" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="opcional" /></Field>
        <Field label="Quadril (cm)"><input type="text" inputMode="decimal" value={hip} onChange={(e) => setHip(e.target.value)} placeholder="opcional" /></Field>
      </div>
      <Field label="Notas (opcional)"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
