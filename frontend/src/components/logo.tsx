import { Activity } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-soft animate-glow">
        <Activity className="h-5 w-5 text-white animate-heartbeat" strokeWidth={2.5} />
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand/60 to-ai-purple/60 blur-lg opacity-70 -z-10" />
      </div>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          MediMind <span className="text-gradient">AI</span>
        </span>
      )}
    </div>
  );
}