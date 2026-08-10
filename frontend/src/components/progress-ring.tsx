import { useEffect, useState } from "react";

export function ProgressRing({
  value,
  max = 100,
  size = 148,
  stroke = 12,
  label,
  sublabel,
  gradientId = "ringGrad",
  from = "#2563eb",
  to = "#38bdf8",
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
  from?: string;
  to?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setProgress(value));
    return () => cancelAnimationFrame(t);
  }, [value]);
  const offset = c - (Math.min(progress, max) / max) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 8px ${to}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold font-display text-gradient">{label ?? value}</div>
        {sublabel && <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{sublabel}</div>}
      </div>
    </div>
  );
}