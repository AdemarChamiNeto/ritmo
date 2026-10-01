import { useState } from "react";
import ChipGroup from "../components/ChipGroup";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { MEAL_TYPES, type ISODate, type MealType } from "../domain/types";
import { useAppDispatch } from "../store";
import { mealAdded } from "../store/dataSlice";
import { parseNum, type FormProps } from "./util";

const TYPES = MEAL_TYPES.map((m) => m.key);

export default function MealForm({ open, onClose, type, date }: FormProps & { type?: MealType; date?: ISODate }) {
  return open ? <Body onClose={onClose} presetType={type} presetDate={date} /> : null;
}

function Body({ onClose, presetType, presetDate }: { onClose: () => void; presetType?: MealType; presetDate?: ISODate }) {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState(presetDate ?? todayISO());
  const [type, setType] = useState<MealType[]>(presetType ? [presetType] : []);
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [error, setError] = useState("");

  function save() {
    const values = [calories, protein, carbs, fat].map(parseNum);
    if (!type.length) return setError("Escolha o tipo de refeição.");
    if (!description.trim() && values.every((v) => v == null)) return setError("Descreva a refeição ou informe algum valor.");
    if (values.some((v) => v != null && v < 0)) return setError("Os valores não podem ser negativos.");
    const [kcal, p, c, f] = values.map((v) => v ?? 0);
    dispatch(mealAdded({ date, type: type[0], description: description.trim(), calories: kcal, protein: p, carbs: c, fat: f }));
    onClose();
  }

  return (
    <Modal open title="Registrar refeição" onClose={onClose}
      actions={<><button className="btn btn-outline" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Salvar refeição</button></>}>
      <Field label="Data"><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></Field>
      <span className="label">Refeição</span>
      <ChipGroup label="Tipo de refeição" options={TYPES} selected={type} onChange={setType} />
      <Field label="Descrição"><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: frango grelhado com arroz e salada" /></Field>
      <div className="grid-2">
        <Field label="Calorias (kcal)"><input type="text" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} /></Field>
        <Field label="Proteína (g)"><input type="text" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} /></Field>
        <Field label="Carboidratos (g)"><input type="text" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></Field>
        <Field label="Gordura (g)"><input type="text" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)} /></Field>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
