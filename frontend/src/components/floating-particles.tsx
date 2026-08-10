export function FloatingParticles({ count = 14 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => {
        const size = 4 + ((i * 7) % 10);
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const delay = (i % 7) * 0.6;
        const dur = 6 + (i % 5);
        const color = ["#60a5fa", "#60a5fa", "#38bdf8", "#4ade80"][i % 4];
        return (
          <span
            key={i}
            className="absolute rounded-full animate-drift"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 12px ${color}`,
              opacity: 0.45,
              animationDelay: `-${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        );
      })}
    </div>
  );
}