import { useState } from "react";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { MEDICATIONS } from "../domain/types";
import { useAppDispatch, useAppSelector } from "../store";
import { configSaved, goalSet } from "../store/dataSlice";
import { parseNum, type FormProps } from "./util";

export default function ConfigForm({ open, onClose }: FormProps) {
  return open ? <Body onClose={onClose} /> : null;
}

function Body({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const config = useAppSelector((s) => s.data.config);
  const waterGoal = useAppSelector((s) => s.data.goals.water);
  const [medication, setMedication] = useState(config?.medication ?? MEDICATIONS[0]);
  const [dose, setDose] = useState(config ? String(config.dose) : "");
  const [frequency, setFrequency] = useState(String(config?.frequencyDays ?? 7));
  const [lastDate, setLastDate] = useState(config?.lastDoseDate ?? todayISO());
  const [water, setWater] = useState(String(waterGoal));
  const [error, setError] = useState("");

  function save() {
    const doseMg = parseNum(dose);
    if (doseMg == null || doseMg <= 0) return setError("Informe a dose em mg (ex.: 0,5).");
    if (!lastDate || lastDate > todayISO()) return setError("A data da última dose não pode ser no futuro.");
    dispatch(configSaved({ medication, dose: doseMg, frequencyDays: Number(frequency), lastDoseDate: lastDate }));
    dispatch(goalSet({ goal: "water", value: parseNum(water) }));
    onClose();
  }

  return (
    <Modal open title="Seu tratamento" onClose={onClose}
      actions={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar</button></>}>
      <p className="hint" style={{ marginTop: 0 }}>Os dados ficam salvos só neste aparelho. Faça backup em Ajustes.</p>
      <Field label="Medicamento">
        <select value={medication} onChange={(e) => setMedication(e.target.value)}>
          {MEDICATIONS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Dose (mg)"><input type="text" inputMode="decimal" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="ex: 0,5" /></Field>
      <Field label="Frequência">
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <option value="7">Semanal</option>
          <option value="14">A cada 14 dias</option>
          <option value="1">Diária</option>
        </select>
      </Field>
      <Field label="Data da última dose"><input type="date" value={lastDate} max={todayISO()} onChange={(e) => setLastDate(e.target.value)} /></Field>
      <Field label="Meta diária de água (ml)"><input type="number" inputMode="numeric" step={50} min={500} value={water} onChange={(e) => setWater(e.target.value)} /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
