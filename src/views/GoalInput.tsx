import { useState } from "react";
import Field from "../components/Field";
import { parseNum } from "../forms/util";

interface Props { label: string; value: number | null; onSave: (v: number | null) => void }

/** Campo de meta com botão salvar e confirmação visual. */
export default function GoalInput({ label, value, onSave }: Props) {
  const [text, setText] = useState(value != null ? String(value).replace(".", ",") : "");
  const [saved, setSaved] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(parseNum(text)); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
      <Field label={label}><input type="text" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <button className="btn btn-primary mt" type="submit">{saved ? "Salvo ✓" : "Salvar meta"}</button>
    </form>
  );
}
