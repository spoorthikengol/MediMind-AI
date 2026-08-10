import { AlertTriangle, ArrowRight, CheckCircle2, Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import type { ChangeStatus, Confidence, ComparisonHighlight } from "@/types/comparison";

interface HeadlineTimelineCardProps {
  headline: string;
  confidence: Confidence;
  reportsCompared: number;
  lastComparedAt: string;
  previousScore: number;
  currentScore: number;
  trend: ChangeStatus;
  previousLabel: string;
  currentLabel: string;
  highlights: ComparisonHighlight[];
}

const trendConfig = {
  improved: { icon: TrendingUp, className: "text-emerald-300" },
  worsened: { icon: TrendingDown, className: "text-red-300" },
  declined: { icon: TrendingDown, className: "text-red-300" },
  worse: { icon: TrendingDown, className: "text-red-300" },
  stable: { icon: Minus, className: "text-white/70" },
} as Record<string, { icon: typeof TrendingUp; className: string }>;

const confidenceStyles: Record<Confidence, string> = {
  High: "bg-emerald-400/20 text-emerald-200",
  Medium: "bg-amber-400/20 text-amber-200",
  Low: "bg-white/15 text-white/80",
};

export function HeadlineTimelineCard({
  headline,
  confidence,
  reportsCompared,
  lastComparedAt,
  previousScore,
  currentScore,
  trend,
  previousLabel,
  currentLabel,
  highlights,
}: HeadlineTimelineCardProps) {
  const config = trendConfig[trend] || trendConfig.stable;
  const TrendIcon = config.icon;

  const biggestImprovement = highlights.find((h) => h.type === "biggest_improvement");
  const biggestConcern = highlights.find((h) => h.type === "biggest_concern");

  const isImproving = String(trend) === "improved";
  const isStable = String(trend) === "stable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-0 gradient-hero text-white shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,white_1px,transparent_1px)] bg-[length:24px_24px] opacity-10" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-90">
            <Sparkles className="h-3.5 w-3.5" />
            AI Headline
            <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal ${confidenceStyles[confidence]}`}>
              {confidence} confidence
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl">
            {headline}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <p className="text-xs opacity-70">{previousLabel}</p>
              <p className="text-3xl font-semibold">{previousScore}</p>
            </div>

            <ArrowRight className="h-5 w-5 opacity-60" />

            <div>
              <p className="text-xs opacity-70">{currentLabel}</p>
              <p className="text-3xl font-semibold">{currentScore}</p>
            </div>

            <div className={`ml-2 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium ${config.className}`}>
              <TrendIcon className="h-4 w-4" />
              {isImproving ? "Improving" : isStable ? "Stable" : "Needs Attention"}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs">
            <span className="opacity-70">{reportsCompared} reports compared</span>
            <span className="h-3 w-px bg-white/20" />
            <span className="opacity-70">Compared {lastComparedAt}</span>
            {biggestImprovement && (
              <>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1 text-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> {biggestImprovement.description}
                </span>
              </>
            )}
            {biggestConcern && (
              <>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1 text-red-200">
                  <AlertTriangle className="h-3 w-3" /> {biggestConcern.description}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}