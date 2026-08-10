export function HeartbeatLine({ className = "", stroke = "url(#hbGrad)" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 600 120" className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="hbGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        d="M0 60 L120 60 L145 60 L155 30 L170 90 L185 20 L200 100 L215 60 L360 60 L380 60 L390 40 L405 80 L420 60 L600 60"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1200"
        className="animate-ecg"
        style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.6))" }}
      />
    </svg>
  );
}