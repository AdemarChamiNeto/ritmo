import { useState } from "react";
import Field from "../components/Field";
import Modal from "../components/Modal";
import { todayISO } from "../domain/dates";
import { useAppDispatch, useAppSelector } from "../store";
import { waterSet } from "../store/dataSlice";
import { parseNum, type FormProps } from "./util";

export default function WaterForm({ open, onClose }: FormProps) {
  return open ? <Body onClose={onClose} /> : null;
}

function Body({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const today = todayISO();
  const current = useAppSelector((s) => s.data.waterDaily[today] ?? 0);
  const [amount, setAmount] = useState("300");
  const [error, setError] = useState("");

  function apply(sign: 1 | -1) {
    const v = parseNum(amount);
    if (v == null || v <= 0 || v > 5000) return setError("Informe uma quantidade entre 1 e 5000 ml.");
    dispatch(waterSet({ date: today, ml: Math.max(0, current + sign * v) }));
    onClose();
  }

  return (
    <Modal open title="Ajustar água de hoje" onClose={onClose}
      actions={<>
        <button className="btn btn-outline" onClick={() => apply(-1)} disabled={!current}>Tirar</button>
        <button className="btn btn-primary" onClick={() => apply(1)}>Adicionar</button>
      </>}>
      <Field label="Quantidade (ml)"><input type="number" inputMode="numeric" step={10} min={10} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Modal>
  );
}
