import { useId, type ReactElement, cloneElement } from "react";

/** Liga <label> e campo pelo id (antes os labels não estavam associados aos inputs). */
export default function Field({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}
