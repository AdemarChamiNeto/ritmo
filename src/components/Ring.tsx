import type { ReactNode } from "react";

interface Props { pct: number; size?: number; stroke?: number; color?: string; children?: ReactNode; label: string }

export default function Ring({ pct, size = 76, stroke = 7, color = "var(--accent)", children, label }: Props) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - clamped)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {children}
    </svg>
  );
}
