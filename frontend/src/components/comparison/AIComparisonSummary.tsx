import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ChevronDown, AlertTriangle, RotateCcw, GitCompare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./ConfidenceBadge";

import type { SummaryBullet, ParameterComparison, ScoreComparison } from "@/types/comparison";

interface AIComparisonSummaryProps {
  bullets: SummaryBullet[];
  parameters: ParameterComparison[];
  scoreComparison: ScoreComparison | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  reportsSelected: boolean;
}

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.05] ${className}`} />;
}

function findWhy(
  bullet: SummaryBullet,
  parameters: ParameterComparison[],
  scoreComparison: ScoreComparison | null
): { previous: number; current: number; difference: number } | null {
  if (bullet.supporting_marker) {
    const match = parameters.find((p) => p.name === bullet.supporting_marker);
    if (match) {
      return {
        previous: match.previous_value,
        current: match.current_value,
        difference: match.difference,
      };
    }
  }

  if (scoreComparison) {
    return {
      previous: scoreComparison.previous,
      current: scoreComparison.current,
      difference: scoreComparison.difference,
    };
  }

  return null;
}

function BulletRow({
  bullet,
  parameters,
  scoreComparison,
}: {
  bullet: SummaryBullet;
  parameters: ParameterComparison[];
  scoreComparison: ScoreComparison | null;
}) {
  const [open, setOpen] = useState(false);
  const why = findWhy(bullet, parameters, scoreComparison);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground">{bullet.text}</p>
        <ConfidenceBadge level={bullet.confidence} />
      </div>

      {why && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand/80"
          >
            Why?
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/10 pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Previous</p>
                    <p className="text-sm font-medium text-foreground">{why.previous}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Current</p>
                    <p className="text-sm font-medium text-foreground">{why.current}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Difference</p>
                    <p
                      className={`text-sm font-medium ${
                        why.difference > 0
                          ? "text-emerald-400"
                          : why.difference < 0
                          ? "text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {why.difference > 0 ? "+" : ""}
                      {why.difference}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

const DISCLAIMER =
  "AI-generated insights are based on uploaded laboratory reports and should not replace professional medical advice.";

export function AIComparisonSummary({
  bullets,
  parameters,
  scoreComparison,
  loading,
  error,
  onRetry,
  reportsSelected,
}: AIComparisonSummaryProps) {
  return (
    <Card className="card-premium border-0 shadow-card backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-brand" />
          AI Comparison Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Generating AI comparison summary">
            <Pulse className="h-16 w-full" />
            <Pulse className="h-16 w-full" />
            <Pulse className="h-16 w-3/4" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Couldn't generate the summary</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : !reportsSelected ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <GitCompare className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Select two reports to generate an AI comparison.
            </p>
          </div>
        ) : bullets.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Not enough comparable data between these reports to generate a summary.
          </p>
        ) : (
          <div className="space-y-2.5">
            {bullets.slice(0, 5).map((bullet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <BulletRow bullet={bullet} parameters={parameters} scoreComparison={scoreComparison} />
              </motion.div>
            ))}
          </div>
        )}

        <p className="border-t border-white/5 pt-3 text-[11px] leading-relaxed text-muted-foreground/70">
          {DISCLAIMER}
        </p>
      </CardContent>
    </Card>
  );
}