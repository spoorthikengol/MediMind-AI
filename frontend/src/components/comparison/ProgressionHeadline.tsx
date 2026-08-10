import { ArrowUp, ArrowRight, ArrowDown, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import type { ScoreEvolution, TestTrend } from "@/types/insights";

interface ProgressionHeadlineProps {
  scoreEvolution: ScoreEvolution;
  trends: Record<string, TestTrend>;
}

type Direction = "improving" | "needs_attention" | "stable";

function pickDrivers(trends: Record<string, TestTrend>, wanted: string[]): string[] {
  const candidates = Object.entries(trends).filter(
    ([, t]) => wanted.includes(t.direction) && t.previous_value !== null
  );

  const sorted = candidates.sort((a, b) => {
    const diffA = Math.abs(a[1].latest_value - (a[1].previous_value ?? 0));
    const diffB = Math.abs(b[1].latest_value - (b[1].previous_value ?? 0));
    return diffB - diffA;
  });

  return sorted.slice(0, 2).map(([name]) => name);
}

function buildHeadline(scoreEvolution: ScoreEvolution, trends: Record<string, TestTrend>): { text: string; direction: Direction } {
  const { current, previous } = scoreEvolution;

  if (current > previous) {
    const drivers = pickDrivers(trends, ["improving"]);
    return {
      direction: "improving",
      text: drivers.length
        ? `Your health trend is improving, mainly driven by improved ${drivers.join(" and ")}.`
        : "Your health trend is improving.",
    };
  }

  if (current < previous) {
    const drivers = pickDrivers(trends, ["declining", "needs_attention"]);
    return {
      direction: "needs_attention",
      text: drivers.length
        ? `Your health trend needs attention, mainly due to ${drivers.join(" and ")}.`
        : "Your health trend needs attention.",
    };
  }

  return { direction: "stable", text: "Your health trend is stable." };
}

const directionConfig: Record<Direction, { icon: typeof ArrowUp; className: string; label: string }> = {
  improving: { icon: ArrowUp, className: "text-emerald-400 bg-emerald-500/10", label: "Improving" },
  needs_attention: { icon: ArrowDown, className: "text-red-400 bg-red-500/10", label: "Declining" },
  stable: { icon: ArrowRight, className: "text-muted-foreground bg-white/5", label: "Stable" },
};

export function ProgressionHeadline({ scoreEvolution, trends }: ProgressionHeadlineProps) {
  const { text, direction } = buildHeadline(scoreEvolution, trends);
  const config = directionConfig[direction];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-premium border-0 shadow-card">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Activity className="h-5 w-5" />
          </span>

          <p className="flex-1 text-sm font-medium leading-relaxed text-foreground sm:text-base">
            {text}
          </p>

          <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}