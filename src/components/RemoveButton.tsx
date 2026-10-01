import { useEffect, useState } from "react";

/** "remover" pede confirmação no segundo toque (volta sozinho depois de 3 s). */
export default function RemoveButton({ onConfirm, what }: { onConfirm: () => void; what: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      className={`del-btn${armed ? " confirm" : ""}`}
      aria-label={armed ? `Confirmar remoção de ${what}` : `Remover ${what}`}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? "confirmar?" : "remover"}
    </button>
  );
}
