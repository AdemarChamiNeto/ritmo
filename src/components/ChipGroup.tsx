interface Props<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (next: T[]) => void;
  multiple?: boolean;
  className?: string;
}

/** Chips como <button aria-pressed> — funcionam com teclado e leitor de tela (antes eram <div>). */
export default function ChipGroup<T extends string>({ label, options, selected, onChange, multiple, className }: Props<T>) {
  function toggle(opt: T) {
    const on = selected.includes(opt);
    if (multiple) onChange(on ? selected.filter((s) => s !== opt) : [...selected, opt]);
    else onChange(on ? [] : [opt]);
  }
  return (
    <div role="group" aria-label={label} className={className ?? "chip-row"}>
      {options.map((opt) => (
        <button type="button" key={opt} className="chip" aria-pressed={selected.includes(opt)} onClick={() => toggle(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}
