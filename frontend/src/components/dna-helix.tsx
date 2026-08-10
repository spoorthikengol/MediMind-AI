export function DnaHelix({ className = "" }: { className?: string }) {
  const rungs = Array.from({ length: 18 });
  return (
    <svg viewBox="0 0 200 400" className={className} aria-hidden>
      <defs>
        <linearGradient id="dnaA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="dnaB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M40 0 C 160 80, 40 160, 160 240 S 40 320, 160 400" stroke="url(#dnaA)" strokeWidth="3" fill="none" opacity="0.8" />
      <path d="M160 0 C 40 80, 160 160, 40 240 S 160 320, 40 400" stroke="url(#dnaB)" strokeWidth="3" fill="none" opacity="0.8" />
      {rungs.map((_, i) => {
        const y = (i + 1) * (400 / (rungs.length + 1));
        const t = (Math.sin((i / rungs.length) * Math.PI * 2) + 1) / 2;
        const x1 = 40 + t * 120;
        const x2 = 160 - t * 120;
        return <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />;
      })}
    </svg>
  );
}