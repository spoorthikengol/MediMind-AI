export function AuroraBg({ variant = "default" }: { variant?: "default" | "subtle" }) {
  const opacity = variant === "subtle" ? "opacity-25" : "opacity-40";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep navy base */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#08111F 0%,#0D1B2A 55%,#13263D 100%)" }} />
      {/* soft edge ambient blue lighting */}
      <div className={`absolute -top-56 -left-40 h-[560px] w-[560px] rounded-full blur-3xl ${opacity}`}
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.55) 0%, transparent 70%)" }} />
      <div className={`absolute -bottom-56 -right-40 h-[620px] w-[620px] rounded-full blur-3xl ${opacity}`}
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)" }} />
      {/* vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
}