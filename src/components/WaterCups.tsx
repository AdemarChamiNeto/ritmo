import { CUP_ML } from "../domain/water";

interface Props { total: number; goal: number; onSet: (ml: number) => void }

/** Um copo = 250 ml. Tocar num copo cheio esvazia até ele; num vazio, enche até ele. */
export default function WaterCups({ total, goal, onSet }: Props) {
  const cups = Math.max(4, Math.round(goal / CUP_ML));
  const filled = Math.round(total / CUP_ML);
  return (
    <div className="cup-grid" role="group" aria-label="Copos de água de 250 ml">
      {Array.from({ length: Math.max(cups, filled) }, (_, i) => (
        <button
          key={i}
          type="button"
          className="cup"
          aria-pressed={i < filled}
          aria-label={`Copo ${i + 1}${i < filled ? " (bebido)" : ""}`}
          onClick={() => onSet((i < filled ? i : i + 1) * CUP_ML)}
        />
      ))}
    </div>
  );
}
