import { ShieldCheck, TrendingUp, Info } from "lucide-react";
import type { Confidence } from "@/types/comparison";

interface ConfidenceBadgeProps {
  level: Confidence;
}

const config: Record<Confidence, { icon: typeof ShieldCheck; label: string; className: string }> = {
  High: {
    icon: ShieldCheck,
    label: "High Confidence",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  Medium: {
    icon: TrendingUp,
    label: "Medium Confidence",
    className: "bg-amber-500/10 text-amber-400",
  },
  Low: {
    icon: Info,
    label: "Low Confidence",
    className: "bg-white/[0.06] text-muted-foreground",
  },
};

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const { icon: Icon, label, className } = config[level];

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}