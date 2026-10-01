interface Props {
  values: number[];
  height?: number;
  goal?: number | null;
  labels?: [string, string];
  ariaLabel: string;
}

/** Gráfico de linha em SVG puro, com linha tracejada da meta quando houver. */
export default function LineChart({ values, height = 150, goal, labels, ariaLabel }: Props) {
  const w = 300, h = height, pad = 14;
  if (!values.length) {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel}>
        <text x="10" y={h / 2} fill="var(--muted)" fontSize="11">Sem dados suficientes ainda</text>
      </svg>
    );
  }
  const all = goal ? [...values, goal] : values;
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const bottom = labels ? h - pad - 10 : h - pad;
  const y = (v: number) => bottom - ((v - min) / range) * (bottom - pad);
  const stepX = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [values.length > 1 ? pad + stepX * i : w / 2, y(v)] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${bottom} L${pts[0][0].toFixed(1)} ${bottom} Z`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
      <path d={area} fill="var(--ink)" opacity="0.08" />
      {goal != null && (
        <line x1={pad} x2={w - pad} y1={y(goal)} y2={y(goal)} stroke="var(--accent)" strokeDasharray="4 4" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      )}
      <path d={line} fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 3.6 : 2.4} fill={i === pts.length - 1 ? "var(--accent)" : "var(--ink)"} />
      ))}
      {labels && (
        <>
          <text x="2" y={h - 2} fontSize="9" fill="var(--muted)">{labels[0]}</text>
          <text x={w - 2} y={h - 2} fontSize="9" fill="var(--muted)" textAnchor="end">{labels[1]}</text>
        </>
      )}
    </svg>
  );
}
